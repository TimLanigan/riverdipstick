# riverdipstick

2.0 preview. The live Streamlit site and collector stay in [river-dipstick](https://github.com/TimLanigan/river-dipstick) at [riverdipstick.uk](https://riverdipstick.uk).

On the home network, open **http://next.local** (no port). That name is published by skynet3. It only works on the LAN.

## Run (skynet3)

```bash
cd /home/tim/src/riverdipstick
docker compose up -d --build
```

API health: http://next.local/health
