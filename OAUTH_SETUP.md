# OAuth Setup Guide

File `.env` local da duoc cap nhat san:

```env
PORT=4209
AUTH_BASE_URL=http://localhost:4209
```

Callback URL dung cho may local nay:

- Google: `http://localhost:4209/auth/google/callback`
- Facebook: `http://localhost:4209/auth/facebook/callback`

## 1. Bat Google Login

### Buoc 1: Tao project Google Cloud

1. Mo `https://console.cloud.google.com/`
2. Tao project moi hoac chon project san co

### Buoc 2: Tao OAuth consent screen

1. Vao `APIs & Services` -> `OAuth consent screen`
2. Chon `External`
3. Dien:
   - App name: ten web cua ban
   - User support email: gmail cua ban
   - Developer contact information: gmail cua ban
4. Save
5. Neu app dang o che do test, vao phan `Test users` va them cac Gmail ban se dung de dang nhap

### Buoc 3: Tao OAuth Client ID

1. Vao `APIs & Services` -> `Credentials`
2. Chon `Create Credentials` -> `OAuth client ID`
3. Application type: `Web application`
4. Dien:
   - Name: `Student Platform Local`
   - Authorized JavaScript origins: `http://localhost:4209`
   - Authorized redirect URIs: `http://localhost:4209/auth/google/callback`
5. Bam `Create`
6. Copy `Client ID` va `Client Secret`

### Buoc 4: Dan vao `.env`

```env
GOOGLE_CLIENT_ID=dan_client_id_google_o_day
GOOGLE_CLIENT_SECRET=dan_client_secret_google_o_day
```

### Ket qua mong doi

- Bam nut `Google`
- Google se mo trang dang nhap/chon tai khoan
- Neu trinh duyet dang luu 2-3 Gmail, Google se hien ra tung tai khoan do Google quan ly
- Chon xong se quay lai web va dang nhap

## 2. Bat Facebook Login

### Buoc 1: Tao app Meta for Developers

1. Mo `https://developers.facebook.com/`
2. Dang nhap Facebook cua ban
3. Vao `My Apps` -> `Create App`
4. Chon loai app phu hop voi dang nhap web
5. Dat ten app va tao app

### Buoc 2: Them Facebook Login

1. Trong dashboard app, them san pham `Facebook Login`
2. Chon nen tang `Web`
3. Site URL co the dien `http://localhost:4209/`

### Buoc 3: Cau hinh OAuth

1. Vao `Facebook Login` -> `Settings`
2. Bat:
   - `Client OAuth Login`
   - `Web OAuth Login`
3. Them `Valid OAuth Redirect URIs`:
   - `http://localhost:4209/auth/facebook/callback`
4. Luu lai

### Buoc 4: Lay App ID va App Secret

1. Vao `App Settings` -> `Basic`
2. Copy:
   - `App ID`
   - `App Secret`

### Buoc 5: Dan vao `.env`

```env
FACEBOOK_CLIENT_ID=dan_app_id_facebook_o_day
FACEBOOK_CLIENT_SECRET=dan_app_secret_facebook_o_day
```

### Ket qua mong doi

- Bam nut `Facebook`
- Facebook se mo trang dang nhap hoac chon tai khoan theo session cua trinh duyet
- Khong phai luc nao cung hien danh sach tai khoan giong Google
- Sau khi chap nhan, web se quay lai va dang nhap

## 3. Khoi dong lai app

Sau khi dan 4 gia tri OAuth vao `.env`, khoi dong lai server:

```bash
npm start
```

## 4. Neu bi loi

### `redirect_uri_mismatch`

- Kiem tra `AUTH_BASE_URL` trong `.env`
- Kiem tra callback URL trong Google/Facebook phai giong 100%
- Neu mo bang `127.0.0.1` thi callback cung phai la `127.0.0.1`, khong duoc de `localhost`

### Google bam vao nhung khong hien tai khoan

- Kiem tra trinh duyet da dang nhap san Gmail chua
- Thu mo `accounts.google.com` trong cung trinh duyet do
- Neu app Google dang o test mode, phai them Gmail do vao `Test users`

### Facebook khong tra email

- Code da duoc xu ly de van tao duoc tai khoan dang nhap trong nhieu truong hop
- Tuy vay, tren dashboard Meta ban van nen de quyen `email` va `public_profile`

## 5. Nhung gi da duoc lam san trong code

- Nut Google/Facebook da tro den route OAuth that
- Google da duoc them `prompt=select_account` de uu tien man hinh chon tai khoan
- Da them `AUTH_BASE_URL` de callback on dinh hon
- Da giu login email/password cu

## 6. File lien quan

- `.env`
- `src/routes/auth.js`
- `src/views/auth/login.ejs`
