import requests

ids = [
    "60ee53676c8c930019487c6e",
    "63acfb33a7f0f0d7b5d19bf0",
    "65839b2e8a6006f851eb33f6",
    "6390fca72b1d6048c902d236",
    "64a7fb2a1d2f605a90d40212"
]

print("Testing Ready Player Me GLB models...")
for i in ids:
    url = f"https://models.readyplayer.me/{i}.glb?morphTargets=ARKit,Oculus+Visemes"
    try:
        r = requests.head(url, timeout=5)
        print(f"ID {i}: Status {r.status_code}")
    except Exception as e:
        print(f"ID {i}: Failed with {e}")
