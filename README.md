# riverdipstick

2.0 preview. The live Streamlit site and collector stay in [river-dipstick](https://github.com/TimLanigan/river-dipstick) at [riverdipstick.uk](https://riverdipstick.uk).

On the home network, open **http://skynet3.local** (no port). It only works on the LAN.

## Run (skynet3)

```bash
cd /home/tim/src/riverdipstick
docker compose up -d --build
```

Pages: `/` starred home, `/rivers`, `/rivers/eden`, `/stations/great-musgrave`. API health: http://skynet3.local/health
