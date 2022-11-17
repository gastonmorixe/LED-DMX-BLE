import noble from "@abandonware/noble"

enum LEDCommands {
  Blue = "7BFF0700FF00FFFFBF",
  Off = "7BFF0400FFFFFFFFBF",
  On = "7BFF0401FFFFFFFFBF",
}

noble.on("stateChange", async (state) => {
  console.log("[stateChange]", state)
  if (state === "poweredOn") {
    try {
      const scanning = await noble.startScanningAsync(["FFB0"], false)
      console.log("[stateChange] scanning", scanning)
    } catch (e) {
      console.error(e)
    }
  }
})

noble.on("discover", async (peripheral) => {
  console.log("[discover]", peripheral)

  // await noble.stopScanningAsync()
  try {
    await peripheral.connectAsync()

    const p = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
      ["FFE0"],
      ["FFE1"]
    )

    const { characteristics } = p
    for (const c of characteristics) {
      console.log("-----")
      console.log("characteristic: ", c.name)
      try {
        console.log("writting...", { c })
        const data = Buffer.from(LEDCommands.On, "hex")
        c.writeAsync(data, true)
      } catch (err) {
        console.log("writting erro")
        console.error(err)
      }
    }
    console.log("characteristics: ", characteristics)
    // const batteryLevel = (await characteristics[0].readAsync())[0]

    console.log(`${peripheral.address} (${peripheral.advertisement.localName})`)

    // try {
    //   const dis = await peripheral.disconnectAsync()
    //   console.log(dis)
    // } catch (e) {
    //   console.error(e)
    // }
    // process.exit(0)
  } catch (e) {
    console.error(e)
  }
})
