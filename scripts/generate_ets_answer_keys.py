from __future__ import annotations

import argparse
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable

import requests
from PIL import Image, ImageOps
from rapidocr_onnxruntime import RapidOCR


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "src" / "data"
TMP_DIR = PROJECT_ROOT / "tmp" / "answer-generation"
HTML_CACHE_DIR = TMP_DIR / "html"
IMAGE_CACHE_DIR = TMP_DIR / "images"
VARIANT_CACHE_DIR = TMP_DIR / "variants"

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    }
)
OCR_ENGINE = RapidOCR()

CHUYENDET_SOURCE_SPECS = {
    2020: {
        "page_url": "https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2020-moi-nhat",
        "mode": "split",
        "test_count": 10,
    },
    2021: {
        "page_url": "https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2021-moi-nhat",
        "mode": "split",
        "test_count": 5,
    },
    2022: {
        "page_url": "https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2022-moi-nhat",
        "mode": "combined",
        "test_count": 10,
    },
    2023: {
        "page_url": "https://chuyendetienganh.com/bai-viet/dap-an-full-test-lcrc-ets-2023-moi-nhat",
        "mode": "combined",
        "test_count": 10,
    },
}

MYTOUR_SOURCE_SPECS = {
    2024: {
        "page_url": "https://mytour.vn/vi/blog/bai-viet/answers-and-amp-detailed-explanation-ets-2024-from-test-1-to-test-10-ets-lc-and-amp-rc.html",
        "section_pattern": r"<h2[^>]*>\s*(?:<strong>)?ETS 2024 Test (\d+) Answers(?:</strong>)?\s*</h2><h3[^>]*>\s*(?:<strong>)?Listening Section(?:</strong>)?\s*</h3>(.*?)(?=<h2[^>]*>\s*(?:<strong>)?ETS 2024 Test \d+ Answers(?:</strong>)?\s*</h2>|$)",
    },
}

SKIPPED_ANSWER_KEY_TARGETS = {
    (2024, 1),
}

IMAGE_URL_PATTERN = re.compile(
    r'https://api\.chuyendetienganh\.com/upload/post_upload/images/[^"<>\s]+'
)
TABLE_ANSWER_PATTERN = re.compile(r">(\d{1,3})\.\s*([ABCD])<", re.IGNORECASE)
READING_HEADING_PATTERN = re.compile(
    r"<h3[^>]*>\s*(?:<strong>)?(?:Reading Section|Đọc)(?:</strong>)?\s*</h3>",
    re.IGNORECASE,
)


def ensure_directories() -> None:
    for directory in (TMP_DIR, HTML_CACHE_DIR, IMAGE_CACHE_DIR, VARIANT_CACHE_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def fetch_text(url: str, cache_path: Path) -> str:
    if cache_path.exists():
        return cache_path.read_text(encoding="utf-8")

    response = SESSION.get(url, timeout=45)
    response.raise_for_status()
    cache_path.write_text(response.text, encoding="utf-8")
    return response.text


def download_file(url: str, destination: Path) -> Path:
    if destination.exists():
        return destination

    response = SESSION.get(url, timeout=60)
    response.raise_for_status()
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(response.content)
    return destination


def dedupe_preserve_order(values: Iterable[str]) -> list[str]:
    seen = set()
    result = []

    for value in values:
        normalized = value.rstrip("\\")
        if normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)

    return result


def extract_chuyendet_image_urls(html: str) -> list[str]:
    return dedupe_preserve_order(match.group(0) for match in IMAGE_URL_PATTERN.finditer(html))


def normalize_token(text: str) -> str:
    return (
        str(text or "")
        .upper()
        .replace("（", "(")
        .replace("）", ")")
        .replace("{", "(")
        .replace("}", ")")
        .replace("[", "(")
        .replace("]", ")")
        .replace(" ", "")
    )


def extract_letter_votes(text: str) -> list[str]:
    normalized = normalize_token(text)
    votes = []

    for char in re.findall(r"[ABCD048]", normalized):
        if char in {"A", "B", "C", "D"}:
            votes.append(char)
        elif char == "0":
            votes.append("D")
        elif char == "4":
            votes.append("A")
        elif char == "8":
            votes.append("B")

    return votes


def cluster_centers(values: list[float], threshold: float, expected_count: int) -> list[float]:
    groups: list[list[float]] = []

    for value in sorted(values):
        if not groups or abs(value - groups[-1][-1]) > threshold:
            groups.append([value])
        else:
            groups[-1].append(value)

    centers = [sum(group) / len(group) for group in groups]

    if len(centers) == expected_count:
        return centers

    if len(centers) < 2:
        raise ValueError("Not enough OCR centers to infer answer grid")

    start = centers[0]
    end = centers[-1]
    step = (end - start) / max(expected_count - 1, 1)
    return [start + (step * index) for index in range(expected_count)]


def save_variant_image(image: Image.Image, destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination)
    return destination


def parse_ocr_variant(image_path: Path) -> dict:
    image = Image.open(image_path).convert("L")
    width, height = image.size
    result, _ = OCR_ENGINE(str(image_path))

    items = []
    for box, text, score in result or []:
        xs = [point[0] for point in box]
        ys = [point[1] for point in box]
        center_x = sum(xs) / 4
        center_y = sum(ys) / 4

        if center_y < (height * 0.10):
            continue

        if not re.search(r"[0-9ABCD]", str(text), re.IGNORECASE):
            continue

        items.append(
            {
                "text": str(text),
                "x": center_x,
                "y": center_y,
                "score": score,
            }
        )

    row_centers = cluster_centers(
        [item["y"] for item in items],
        threshold=max(6, height / 80),
        expected_count=20,
    )
    col_centers = cluster_centers(
        [item["x"] for item in items],
        threshold=max(14, width / 20),
        expected_count=5,
    )

    cells: dict[tuple[int, int], list[dict]] = defaultdict(list)

    for item in items:
        row_index = min(range(len(row_centers)), key=lambda index: abs(item["y"] - row_centers[index]))
        col_index = min(range(len(col_centers)), key=lambda index: abs(item["x"] - col_centers[index]))
        cells[(row_index, col_index)].append(item)

    answers = {}
    raw_tokens = {}

    for row_index in range(20):
        for col_index in range(5):
            token = "".join(
                cell_item["text"]
                for cell_item in sorted(cells.get((row_index, col_index), []), key=lambda value: value["x"])
            )
            raw_tokens[(row_index, col_index)] = token
            votes = extract_letter_votes(token)
            answers[(row_index, col_index)] = votes[-1] if votes else None

    filled_count = sum(1 for answer in answers.values() if answer)

    return {
        "answers": answers,
        "row_centers": row_centers,
        "col_centers": col_centers,
        "raw_tokens": raw_tokens,
        "width": width,
        "height": height,
        "filled_count": filled_count,
    }


def get_geometry_bounds(centers: list[float], total_size: int) -> list[tuple[int, int]]:
    bounds = []

    for index, center in enumerate(centers):
        previous_center = centers[index - 1] if index > 0 else None
        next_center = centers[index + 1] if index < len(centers) - 1 else None

        left = 0 if previous_center is None else (previous_center + center) / 2
        right = total_size if next_center is None else (center + next_center) / 2

        bounds.append((max(0, int(round(left))), min(total_size, int(round(right)))))

    return bounds


def fallback_cell_letter(image: Image.Image, geometry: dict, row_index: int, col_index: int) -> str | None:
    row_bounds = get_geometry_bounds(geometry["row_centers"], geometry["height"])
    col_bounds = get_geometry_bounds(geometry["col_centers"], geometry["width"])

    left, right = col_bounds[col_index]
    top, bottom = row_bounds[row_index]

    horizontal_margin = max(4, int((right - left) * 0.14))
    vertical_margin = max(2, int((bottom - top) * 0.18))

    crop_box = (
        max(0, left - horizontal_margin),
        max(0, top - vertical_margin),
        min(image.width, right + horizontal_margin),
        min(image.height, bottom + vertical_margin),
    )
    if crop_box[2] <= crop_box[0] or crop_box[3] <= crop_box[1]:
        return None
    cell = image.crop(crop_box)

    variants = [
        ImageOps.autocontrast(cell).resize((cell.width * 3, cell.height * 3)),
        ImageOps.autocontrast(cell).point(lambda value: 255 if value > 150 else 0).resize((cell.width * 4, cell.height * 4)),
        ImageOps.autocontrast(cell).point(lambda value: 255 if value > 170 else 0).resize((cell.width * 4, cell.height * 4)),
        ImageOps.autocontrast(cell).point(lambda value: 255 if value > 190 else 0).resize((cell.width * 4, cell.height * 4)),
    ]

    votes = []

    for index, variant in enumerate(variants):
        variant_path = save_variant_image(
            variant,
            VARIANT_CACHE_DIR / f"cell-r{row_index + 1}-c{col_index + 1}-{index}.png",
        )
        result, _ = OCR_ENGINE(str(variant_path))
        text = "".join(item[1] for item in result or [])
        votes.extend(extract_letter_votes(text))

    if not votes:
        return None

    return Counter(votes).most_common(1)[0][0]


def parse_100_answer_grid(image_path: Path, start_number: int) -> dict[int, str]:
    original = Image.open(image_path).convert("L")
    base_name = image_path.stem
    variants = [
        original,
        ImageOps.autocontrast(original),
        ImageOps.autocontrast(original).resize((original.width * 3, original.height * 3)),
        ImageOps.autocontrast(original).point(lambda value: 255 if value > 170 else 0).resize((original.width * 3, original.height * 3)),
    ]

    parsed_variants = []
    per_question_votes: dict[int, list[str]] = defaultdict(list)
    best_variant = None

    for index, variant in enumerate(variants):
        variant_path = save_variant_image(
            variant,
            VARIANT_CACHE_DIR / f"{base_name}-variant-{index}.png",
        )
        parsed = parse_ocr_variant(variant_path)
        parsed_variants.append(parsed)

        if best_variant is None or parsed["filled_count"] > best_variant["filled_count"]:
            best_variant = parsed

        for row_index in range(20):
            for col_index in range(5):
                local_question = (row_index * 5) + col_index + 1
                answer = parsed["answers"][(row_index, col_index)]
                if answer:
                    per_question_votes[local_question].append(answer)

    if best_variant is None:
        raise ValueError(f"Could not OCR answer grid from {image_path}")

    final_answers = {}

    for local_question in range(1, 101):
        votes = per_question_votes.get(local_question, [])
        if votes:
            final_answers[local_question] = Counter(votes).most_common(1)[0][0]
        else:
            final_answers[local_question] = None

    suspicious_questions = [
        local_question
        for local_question in range(1, 101)
        if final_answers[local_question] is None or len(set(per_question_votes.get(local_question, []))) > 1
    ]

    for local_question in suspicious_questions:
        row_index = (local_question - 1) // 5
        col_index = (local_question - 1) % 5
        fallback_answer = fallback_cell_letter(original, best_variant, row_index, col_index)
        if fallback_answer:
            final_answers[local_question] = fallback_answer

    numbered_answers = {
        start_number + local_question - 1: final_answers[local_question]
        for local_question in range(1, 101)
    }

    missing = [question for question, answer in numbered_answers.items() if answer not in {"A", "B", "C", "D"}]
    if missing:
        raise ValueError(f"Missing OCR answers for questions: {missing[:10]}")

    return numbered_answers


def parse_combined_200_image(image_path: Path) -> dict[int, str]:
    combined = Image.open(image_path)
    width, height = combined.size
    left_path = IMAGE_CACHE_DIR / f"{image_path.stem}-left.png"
    right_path = IMAGE_CACHE_DIR / f"{image_path.stem}-right.png"

    combined.crop((0, 0, width // 2, height)).save(left_path)
    combined.crop((width // 2, 0, width, height)).save(right_path)

    answers = {}
    answers.update(parse_100_answer_grid(left_path, 1))
    answers.update(parse_100_answer_grid(right_path, 101))
    return answers


def load_chuyendet_answer_maps(year: int) -> dict[int, dict]:
    spec = CHUYENDET_SOURCE_SPECS[year]
    html = fetch_text(spec["page_url"], HTML_CACHE_DIR / f"chuyendet-{year}.html")
    image_urls = extract_chuyendet_image_urls(html)
    test_count = spec["test_count"]

    if spec["mode"] == "combined":
        selected_urls = image_urls[:test_count]
        return {
            test_number: {"combined": selected_urls[test_number - 1], "source_url": spec["page_url"]}
            for test_number in range(1, test_count + 1)
        }

    reading_urls = image_urls[:test_count]
    listening_urls = image_urls[test_count:test_count * 2]

    return {
        test_number: {
            "listening": listening_urls[test_number - 1],
            "reading": reading_urls[test_number - 1],
            "source_url": spec["page_url"],
        }
        for test_number in range(1, test_count + 1)
    }


def build_ocr_answer_keys(year: int, target_tests: set[int] | None = None) -> dict[int, tuple[dict[int, str], list[str]]]:
    answer_maps = load_chuyendet_answer_maps(year)
    result = {}

    for test_number, source_info in answer_maps.items():
        if target_tests is not None and test_number not in target_tests:
            continue

        print(f"OCR ETS {year} Test {test_number}")

        if "combined" in source_info:
            image_url = source_info["combined"]
            image_path = download_file(
                image_url,
                IMAGE_CACHE_DIR / f"ets-{year}-test-{test_number}.png",
            )
            try:
                answers = parse_combined_200_image(image_path)
            except Exception as error:
                raise ValueError(f"Failed OCR for ETS {year} Test {test_number}: {error}") from error
            result[test_number] = (answers, [source_info["source_url"], image_url])
            continue

        listening_path = download_file(
            source_info["listening"],
            IMAGE_CACHE_DIR / f"ets-{year}-test-{test_number}-listening.png",
        )
        reading_path = download_file(
            source_info["reading"],
            IMAGE_CACHE_DIR / f"ets-{year}-test-{test_number}-reading.png",
        )

        answers = {}
        try:
            answers.update(parse_100_answer_grid(listening_path, 1))
            answers.update(parse_100_answer_grid(reading_path, 101))
        except Exception as error:
            raise ValueError(f"Failed OCR for ETS {year} Test {test_number}: {error}") from error
        result[test_number] = (
            answers,
            [source_info["source_url"], source_info["listening"], source_info["reading"]],
        )

    return result


def build_text_answer_keys(year: int, target_tests: set[int] | None = None) -> dict[int, tuple[dict[int, str], list[str]]]:
    spec = MYTOUR_SOURCE_SPECS[year]
    html = fetch_text(spec["page_url"], HTML_CACHE_DIR / f"mytour-{year}.html")
    section_pattern = re.compile(
        spec["section_pattern"],
        re.IGNORECASE | re.DOTALL,
    )

    result = {}

    for match in section_pattern.finditer(html):
        test_number = int(match.group(1))
        if target_tests is not None and test_number not in target_tests:
            continue
        body = match.group(2)
        reading_match = READING_HEADING_PATTERN.search(body)
        listening_body = body[:reading_match.start()] if reading_match else body
        reading_body = body[reading_match.end():] if reading_match else ""

        listening_answers = {}
        for question_number_raw, answer_letter in TABLE_ANSWER_PATTERN.findall(listening_body):
            question_number = int(question_number_raw)
            if 1 <= question_number <= 100 and question_number not in listening_answers:
                listening_answers[question_number] = answer_letter.upper()

        reading_answers = {}
        for question_number_raw, answer_letter in TABLE_ANSWER_PATTERN.findall(reading_body):
            question_number = int(question_number_raw)
            if question_number not in reading_answers:
                reading_answers[question_number] = answer_letter.upper()

        if reading_answers and max(reading_answers) <= 100:
            reading_answers = {
                question_number + 100: answer_letter
                for question_number, answer_letter in reading_answers.items()
            }

        answers = {**listening_answers, **reading_answers}

        if len(answers) != 200:
            raise ValueError(
                f"Expected 200 answers for ETS {year} Test {test_number}, received {len(answers)}"
            )

        result[test_number] = (answers, [spec["page_url"]])

    return result


def format_answer_array(answer_values: list[str]) -> str:
    lines = []
    for index in range(0, len(answer_values), 10):
        chunk = ", ".join(f"'{value}'" for value in answer_values[index:index + 10])
        lines.append(f"  {chunk}")
    return ",\n".join(lines)


def render_answer_key_module(sources: list[str], answers: dict[int, str]) -> str:
    listening = [answers[number] for number in range(1, 101)]
    reading_relative = [answers[number] for number in range(101, 201)]
    source_lines = "\n".join(f"// - {source}" for source in sources)

    return (
        "// Generated from public answer sources:\n"
        f"{source_lines}\n"
        "const listening = [\n"
        f"{format_answer_array(listening)}\n"
        "];\n\n"
        "const readingRelative = [\n"
        f"{format_answer_array(reading_relative)}\n"
        "];\n\n"
        "const answerKey = {};\n\n"
        "listening.forEach((answer, index) => {\n"
        "  answerKey[index + 1] = answer;\n"
        "});\n\n"
        "readingRelative.forEach((answer, index) => {\n"
        "  answerKey[index + 101] = answer;\n"
        "});\n\n"
        "module.exports = answerKey;\n"
    )


def write_answer_key_file(year: int, test_number: int, answers: dict[int, str], sources: list[str]) -> None:
    destination = DATA_DIR / f"ets{year}Test{test_number}AnswerKey.js"
    destination.write_text(render_answer_key_module(sources, answers), encoding="utf-8")


def persist_generated_tests(year: int, tests: dict[int, tuple[dict[int, str], list[str]]]) -> None:
    for test_number, (answers, sources) in sorted(tests.items()):
        if len(answers) != 200:
            raise ValueError(f"ETS {year} Test {test_number} does not have 200 answers")
        write_answer_key_file(year, test_number, answers, sources)
        print(f"Generated ets{year}Test{test_number}AnswerKey.js from {sources[0]}")


def get_missing_target_tests(year: int, max_test_number: int) -> set[int]:
    targets = set()

    for test_number in range(1, max_test_number + 1):
        if (year, test_number) in SKIPPED_ANSWER_KEY_TARGETS:
            continue

        destination = DATA_DIR / f"ets{year}Test{test_number}AnswerKey.js"
        if not destination.exists():
            targets.add(test_number)

    return targets


def generate_all_answer_keys(selected_years: set[int] | None = None) -> None:
    ensure_directories()

    for year, spec in MYTOUR_SOURCE_SPECS.items():
        if selected_years and year not in selected_years:
            continue
        target_tests = get_missing_target_tests(year, 10)
        if target_tests:
            persist_generated_tests(
                year,
                build_text_answer_keys(year, target_tests=target_tests),
            )

    for year, spec in CHUYENDET_SOURCE_SPECS.items():
        if selected_years and year not in selected_years:
            continue
        target_tests = get_missing_target_tests(year, spec["test_count"])
        if target_tests:
            persist_generated_tests(
                year,
                build_ocr_answer_keys(year, target_tests=target_tests),
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--year",
        dest="years",
        action="append",
        type=int,
        help="Generate answer keys only for a specific ETS year. Repeat for multiple years.",
    )
    args = parser.parse_args()
    generate_all_answer_keys(selected_years=set(args.years or []))
