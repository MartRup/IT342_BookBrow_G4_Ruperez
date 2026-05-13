import os
import re
import shutil

base_dir = r"app\src\main\kotlin\edu\ruperez\bookbrow"

# Define target paths
targets = {
    "feature/auth": [
        "data/remote/api/AuthApiService.kt",
        "data/remote/model/AuthModels.kt",
        "data/repository/AuthRepository.kt",
        "ui/auth/AuthViewModel.kt",
        "ui/auth/LoginActivity.kt",
        "ui/auth/RegisterActivity.kt"
    ],
    "feature/main": [
        "ui/main/MainActivity.kt"
    ],
    "feature/splash": [
        "ui/splash/SplashActivity.kt"
    ],
    "shared": [
        "data/local/SessionManager.kt",
        "data/remote/RetrofitClient.kt",
        "BaseActivity.kt"
    ]
}

# Create new directories
for target in targets:
    os.makedirs(os.path.join(base_dir, target), exist_ok=True)

# Move files
for target, files in targets.items():
    for f in files:
        src = os.path.join(base_dir, os.path.normpath(f))
        if os.path.exists(src):
            dst = os.path.join(base_dir, target, os.path.basename(f))
            shutil.move(src, dst)
            print(f"Moved {src} -> {dst}")

# Define package mapping
pkg_map = {
    "edu.ruperez.bookbrow.data.remote.api": "edu.ruperez.bookbrow.feature.auth",
    "edu.ruperez.bookbrow.data.remote.model": "edu.ruperez.bookbrow.feature.auth",
    "edu.ruperez.bookbrow.data.repository": "edu.ruperez.bookbrow.feature.auth",
    "edu.ruperez.bookbrow.ui.auth": "edu.ruperez.bookbrow.feature.auth",
    "edu.ruperez.bookbrow.ui.main": "edu.ruperez.bookbrow.feature.main",
    "edu.ruperez.bookbrow.ui.splash": "edu.ruperez.bookbrow.feature.splash",
    "edu.ruperez.bookbrow.data.local": "edu.ruperez.bookbrow.shared",
    "edu.ruperez.bookbrow.data.remote": "edu.ruperez.bookbrow.shared",
    "edu.ruperez.bookbrow": "edu.ruperez.bookbrow.shared" # for BaseActivity, but needs careful handling
}

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to replace old packages with new ones in imports and package declaration
    # This might require multiple passes
    for old_pkg, new_pkg in pkg_map.items():
        if old_pkg == "edu.ruperez.bookbrow":
            # Only match exact package or package.BaseActivity
            content = re.sub(r'package edu\.ruperez\.bookbrow$', f'package {new_pkg}', content, flags=re.MULTILINE)
            content = re.sub(r'import edu\.ruperez\.bookbrow\.BaseActivity', f'import {new_pkg}.BaseActivity', content)
        else:
            content = re.sub(r'package ' + re.escape(old_pkg), f'package {new_pkg}', content)
            content = re.sub(r'import ' + re.escape(old_pkg), f'import {new_pkg}', content)

    # Manual fixes for auth
    content = content.replace("import edu.ruperez.bookbrow.shared.RetrofitClient", "import edu.ruperez.bookbrow.shared.RetrofitClient")
    content = content.replace("import edu.ruperez.bookbrow.shared.SessionManager", "import edu.ruperez.bookbrow.shared.SessionManager")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Update all kt files
for root, _, files in os.walk(base_dir):
    for f in files:
        if f.endswith(".kt"):
            update_file(os.path.join(root, f))
            print(f"Updated {f}")

# Cleanup empty dirs
for d in ["data", "ui"]:
    dpath = os.path.join(base_dir, d)
    if os.path.exists(dpath):
        shutil.rmtree(dpath)
        print(f"Removed {dpath}")
