# Trademark Policy — TigerTag, TigerScale & Tiger Studio

## TL;DR

- ✅ You can **make and sell** hardware based on this design, freely and commercially.
- ✅ You can call your product **"TigerScale"** if it runs the official firmware unmodified.
- ✅ You can **fork** the firmware and build something different — just use a different product name.
- ❌ You cannot use the **TigerTag** name for a competing RFID protocol or cloud service.
- ❌ You cannot name a fork or derivative app **"Tiger Studio"** without authorization.
- ❌ You cannot claim **official TigerTag certification** without authorization.

---

## The TigerTag name

**"TigerTag"** is a trademark of the TigerTag Project.

TigerTag refers to the **RFID spool-tracking protocol** and the **cloud service**
(`tigertag.io`) that synchronizes filament inventory across devices.

You may reference "TigerTag" in a factual, descriptive way
(e.g. *"compatible with TigerTag"*, *"works with the TigerTag cloud"*)
without permission.

You may **not** use "TigerTag" as the name of a competing RFID protocol,
cloud service, or product brand without explicit written authorization.

---

## The TigerScale name

**"TigerScale"** identifies the official open-source smart scale design published
at [github.com/TigerTag-Project/Tiger_Scale](https://github.com/TigerTag-Project/Tiger_Scale).

### You MAY call your product "TigerScale" if

1. It is based on the hardware design published in this repository.
2. It runs the **official firmware** from this repository, unmodified or with
   only changes that have been contributed back and merged into the main branch.
3. The firmware self-identifies with the official version string
   (e.g. `fw_version: "2.0.0"`), not a custom fork string.

In other words: if you build and sell hardware running the official firmware,
you are making an **official TigerScale** and may use the name freely.

### You MAY NOT call your product "TigerScale" if

- It runs a modified, forked, or custom firmware that diverges from the main branch.
- It does not implement the TigerTag RFID protocol as specified.
- It uses the TigerScale or TigerTag name to imply official endorsement
  without authorization.

If you fork the firmware for a different product, please use a different name.
We encourage forks — just make them clearly distinct from the official TigerScale.

---

## Commercial manufacturing — what you need to know

There is **no license fee, no royalty, and no registration required** to
manufacture and sell TigerScale hardware.

To produce compliant TigerScale units:

1. **Build the hardware** — follow the BOM and wiring diagram in
   [`hardware/BOM.md`](hardware/BOM.md) and [`docs/HARDWARE.md`](docs/HARDWARE.md).
2. **Flash the latest official firmware** — always use the most recent release
   from this repository. The Web Installer at
   [tigertag-project.github.io/Tiger_Scale](https://tigertag-project.github.io/Tiger_Scale/)
   always serves the latest official build.
3. **Do not modify core identification strings** — `TIGERSCALE_FW_VERSION`,
   `TIGERSCALE_GIT_SHA`, and the mDNS hostname pattern `tigerscale-XXXX` must
   remain intact so the device is recognized by TigerTag apps.

That's it. No paperwork, no approval process.

---

## Why these rules exist

TigerScale is free and open-source. We want as many people as possible
to build, use, and sell it.

The trademark policy exists for one reason: **user trust**.

If someone buys a "TigerScale" that runs unofficial firmware, it may not
connect to the TigerTag cloud, may have inaccurate weighing, or may behave
unexpectedly. The trademark ensures that the name "TigerScale" means something
consistent — a device that just works with the TigerTag ecosystem.

---

## Tiger Studio

**"Tiger Studio"** is also a protected trademark of the TigerTag Project.
Forks are welcome under the MIT License but must use a distinct name.
Forks may display **"Powered by Tiger Studio"** / **"Built on Tiger Studio"** as attribution.

See the [Tiger Studio trademark policy](https://github.com/TigerTag-Project/TigerTag_Studio_Manager/blob/main/TRADEMARK.md)
for the full forking and attribution guidelines.

---

## Questions

Open an issue or reach us on [Discord](https://discord.gg/3Qv5TSqnJH).
For trademark authorization requests: contact via [tigertag.io](https://tigertag.io).
