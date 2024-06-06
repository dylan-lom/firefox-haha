/* Background script cannot modify page content; content script cannot listen
 * for commands. This is just a thin main application to process the command */
browser.commands.onCommand.addListener(async commandName => {
    console.log({ message: 'Got command:', commandName })
    if (commandName !== "display-hints") {
        throw new Error(`Unknown command: ${commandName.name}`)
    }

    const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true })
    console.log({ currentTab })
    await browser.tabs.sendMessage(
        currentTab.id,
        "display-hints"
    )
})