import noble from "@abandonware/noble"
import argv from "minimist"

const args = argv(process.argv.slice(2))

console.log("args", args)

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

        let cmd: LEDCommands = LEDCommands.On
        if (args._.includes("off")) {
          console.log("OFF !!!!", { c })
          cmd = LEDCommands.Off
        }
        const data = Buffer.from(cmd, "hex")
        const write = await c.writeAsync(data, true)
        console.log("write:", write)
      } catch (err) {
        console.log("writting erro")
        console.error(err)
      }
    }

    // process.exit(0)

    console.log("characteristics: ", characteristics)
    // const batteryLevel = (await characteristics[0].readAsync())[0]

    console.log(`${peripheral.address} (${peripheral.advertisement.localName})`)

    // setTimeout(async () => {
    //   try {
    //     const dis = await peripheral.disconnectAsync()
    //     console.log("dis: ", dis)
    //   } catch (e) {
    //     console.log("disc error")
    //     console.error(e)
    //   }
    // }, 5000)
  } catch (e) {
    console.log("error end")
    console.error(e)
  }

  setTimeout(() => {
    process.exit(0)
  }, 5000)
})
