# Chatbot Upgrade

## Muc tieu

Chatbot da duoc nang cap theo kieu hybrid:

- tra loi chinh xac theo du lieu noi bo cua website
- nho ngu canh hoi thoai ngan trong session
- ho tro goi y khoa hoc va lop hoc sat hon
- co the bat lop AI ngoai de tra loi rong hon nhu ChatGPT

## Cac nhom cau hoi chatbot da xu ly tot hon

- khoa hoc, hoc phi, uu dai
- lo trinh TOEIC / IELTS theo muc tieu diem
- lich khai giang, loc theo co so va khung gio
- placement test / full test
- dang ky, dang nhap, Google / Facebook login, OTP da bo
- classroom hoc vien, nop bai, dictation, reading, practice
- lien he trung tam

## Bat che do AI

Them cac bien sau vao `.env`:

```env
OPENAI_API_KEY=your_api_key
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_CHATBOT_MODEL=gpt-5.2-chat-latest
OPENAI_CHATBOT_MAX_OUTPUT=500
```

Neu khong co `OPENAI_API_KEY`, chatbot van chay bang kho kien thuc noi bo.

## Cac file chinh da doi

- `src/data/chatbotKnowledge.js`
- `src/services/chatbotService.js`
- `src/routes/chatbot.js`
- `src/views/partials/engagement-widgets.ejs`
- `.env.example`
