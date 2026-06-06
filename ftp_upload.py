#!/usr/bin/env python3
import ftplib
import io
import os
import sys

FTP_HOST = os.environ.get("FTP_HOST", "")
FTP_USER = os.environ.get("FTP_USER", "")
FTP_PASS = os.environ.get("FTP_PASS", "")
LOCAL_DIR = ".next/standalone"
REMOTE_DIR = os.environ.get("FTP_REMOTE_DIR", "/google-ai.chomthongschool.ac.th")
EXTRA_DIRS = [
    (".next/static", f"{REMOTE_DIR}/.next/static"),
    ("public", f"{REMOTE_DIR}/public"),
]
PROD_ENV = f"""DB_HOST={os.environ.get("PROD_DB_HOST", "localhost")}
DB_PORT={os.environ.get("PROD_DB_PORT", "3306")}
DB_USER={os.environ.get("PROD_DB_USER", "")}
DB_PASSWORD={os.environ.get("PROD_DB_PASSWORD", "")}
DB_NAME={os.environ.get("PROD_DB_NAME", "")}
ADMIN_PASSWORD={os.environ.get("PROD_ADMIN_PASSWORD", "")}
NODE_ENV=production
"""

uploaded = 0
errors = []

def mkdirs(ftp, path):
    parts = path.strip("/").split("/")
    cur = ""
    for p in parts:
        cur += "/" + p
        try:
            ftp.mkd(cur)
        except ftplib.error_perm:
            pass

def upload_dir(ftp, local_path, remote_path):
    global uploaded
    if not os.path.exists(local_path):
        errors.append(f"{remote_path}: local path does not exist, skipped")
        return
    mkdirs(ftp, remote_path)
    try:
        items = sorted(os.listdir(local_path))
    except FileNotFoundError:
        errors.append(f"{remote_path}: local path disappeared, skipped")
        return
    for item in items:
        lp = os.path.join(local_path, item)
        rp = remote_path + "/" + item
        if os.path.isdir(lp) and not os.path.islink(lp):
            upload_dir(ftp, lp, rp)
        elif os.path.isfile(lp):
            try:
                with open(lp, "rb") as f:
                    ftp.storbinary(f"STOR {rp}", f)
                uploaded += 1
                if uploaded % 20 == 0:
                    print(f"  อัพแล้ว {uploaded} ไฟล์... ({item})")
            except Exception as e:
                errors.append(f"{rp}: {e}")
                print(f"  ✗ {rp}: {e}")
        else:
            errors.append(f"{rp}: unsupported local path, skipped")

def upload_file(ftp, local_path, remote_path):
    global uploaded
    mkdirs(ftp, os.path.dirname(remote_path))
    with open(local_path, "rb") as f:
        ftp.storbinary(f"STOR {remote_path}", f)
    uploaded += 1
    print(f"  อัพโหลด {remote_path}")

def upload_text(ftp, text, remote_path):
    global uploaded
    mkdirs(ftp, os.path.dirname(remote_path))
    data = io.BytesIO(text.encode("utf-8"))
    ftp.storbinary(f"STOR {remote_path}", data)
    uploaded += 1
    print(f"  อัพโหลด {remote_path}")

def main():
    required = {
        "FTP_HOST": FTP_HOST,
        "FTP_USER": FTP_USER,
        "FTP_PASS": FTP_PASS,
        "PROD_DB_USER": os.environ.get("PROD_DB_USER", ""),
        "PROD_DB_PASSWORD": os.environ.get("PROD_DB_PASSWORD", ""),
        "PROD_DB_NAME": os.environ.get("PROD_DB_NAME", ""),
        "PROD_ADMIN_PASSWORD": os.environ.get("PROD_ADMIN_PASSWORD", ""),
    }
    missing = [key for key, value in required.items() if not value]
    if missing:
        print("Missing required environment variables: " + ", ".join(missing))
        sys.exit(1)

    print(f"เชื่อมต่อ FTP {FTP_HOST}...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, 21, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.set_pasv(True)
    print("เชื่อมต่อสำเร็จ\n")

    # ลบ index.html เดิมออก
    try:
        ftp.delete(f"{REMOTE_DIR}/index.html")
        print("ลบ index.html เดิมออกแล้ว")
    except:
        pass

    print(f"กำลังอัพโหลด runtime ไปที่ {REMOTE_DIR} ...")
    upload_dir(ftp, LOCAL_DIR, REMOTE_DIR)
    for local_dir, remote_dir in EXTRA_DIRS:
        print(f"\nกำลังอัพโหลด {local_dir} ไปที่ {remote_dir} ...")
        upload_dir(ftp, local_dir, remote_dir)

    print("\nกำลังตั้งค่าไฟล์ production ...")
    upload_file(ftp, ".next/standalone/server.js", f"{REMOTE_DIR}/app.js")
    upload_text(ftp, PROD_ENV, f"{REMOTE_DIR}/.env")
    upload_text(ftp, "", f"{REMOTE_DIR}/tmp/restart.txt")

    ftp.quit()
    print(f"\n✓ อัพโหลดสำเร็จ {uploaded} ไฟล์")
    if errors:
        print(f"✗ มีข้อผิดพลาด {len(errors)} ไฟล์:")
        for e in errors[:10]:
            print(f"  {e}")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
