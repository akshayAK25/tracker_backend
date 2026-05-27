

# import asyncio
# from bleak import BleakScanner

# async def scan():
#     while True:

#         devices = await BleakScanner.discover(
#             return_adv=True,
#             timeout=5.0
#         )

#         print("\n--- DEVICES FOUND ---")

#         for address, (device, adv) in devices.items():

#             print(
#                 f"Name: {device.name} | "
#                 f"RSSI: {adv.rssi}"
#             )

#         await asyncio.sleep(2)

# asyncio.run(scan())

# ----------------------------------------------------------------------------------------------------------------------

# import asyncio
# from bleak import BleakScanner

# TARGET_DEVICES = [
#     "tracker1",
#     "tracker2"
# ]

# async def scan():

#     while True:

#         devices = await BleakScanner.discover(
#             return_adv=True,
#             timeout=5.0
#         )

#         print("\n--- TRACKERS FOUND ---")

#         for address, (device, adv) in devices.items():

#             if device.name and device.name.lower() in TARGET_DEVICES:

#                 print(
#                     f"Name: {device.name} | "
#                     f"RSSI: {adv.rssi}"
#                 )

#         await asyncio.sleep(2)

# asyncio.run(scan())


# ----------------------------------------------------------------------------------------------------------------------


import asyncio
import requests
from bleak import BleakScanner

TARGET_DEVICES = [
    "tracker1",
    "tracker2"
]

API_URL = "http://localhost:3000/rssi"

async def scan():

    while True:

        devices = await BleakScanner.discover(
            return_adv=True,
            timeout=5.0
        )

        print("\n--- TRACKERS FOUND ---")

        for address, (device, adv) in devices.items():

            if device.name and device.name.lower() in TARGET_DEVICES:

                data = {
                    "receiver": "LaptopReceiver1",
                    "device": device.name,
                    "rssi": adv.rssi
                }

                print(data)

                try:

                    response = requests.post(
                        API_URL,
                        json=data
                    )

                    print("Sent:", response.status_code)

                except Exception as e:

                    print("API Error:", e)

        await asyncio.sleep(2)

asyncio.run(scan())





























