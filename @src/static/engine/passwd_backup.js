// Let's see if you can discover the password in the middle of that mess :)
// PS: It should be very very easy!

console.log(localStorage.getItem("projectID"))
const inputs = document.querySelectorAll('.password--container input')

inputs.forEach((input, index) => {
    input.dataset.index = index
    input.addEventListener("keyup", checkPassword)
})

function checkPassword(e) {
    console.log(e.target.value)
    const input = e.target
    let value = input.value
    input.value = ""
    input.value = value ? value[0] : ""
    let fieldIndex = input.dataset.index
    console.log(fieldIndex)

    if (fieldIndex == 5) {
        showButton()
    }
}

function showButton() {
    var elementX = "MUE4NFhZ"
    var mixedElementX = atob(elementX)
    // Show button here
    console.log("Password confirmed.")
    let passwd = ""
    inputs.forEach((input) => {
        passwd += input.value
    })
    console.log(passwd)
    if (passwd == mixedElementX) {
        inputs.forEach((input) => {
            input.classList.add("correct-password")
        }
        )
        var redirectPage = setInterval(redirectProject, 2500)
    } else {
        console.log("Wrong password.")

        inputs.forEach((input) => {
            input.classList.add("incorrect-password")
            // clear input fields
            input.value = ""
        }
        )
    }
}

function redirectProject() {
    var elementY00 = "aHR0cHM6Ly93d3cuZmlnbWEuY29tL3Byb3RvL0JVU1lqdlJJM1ZGOTlPTWhQYWhQcVovUHJvamVjdC1DdWx0dXJhP3BhZ2UtaWQ9MTA0OSUzQTEyNDA2Jm5vZGUtaWQ9MTA0OSUzQTEyNDA3JnZpZXdwb3J0PTE1MSUyQzc4JTJDMC4wNiZzY2FsaW5nPXNjYWxlLWRvd24mc3RhcnRpbmctcG9pbnQtbm9kZS1pZD0xMDQ5JTNBMTI0MDc="

    var elementY01 = "aHR0cHM6Ly93d3cuZmlnbWEuY29tL2ZpbGUvdnJmZVp4Nm40UVZtNk5qdmNsNGNERy9SZW1vdGlzaC1QYWdlcz9ub2RlLWlkPTc1NiUzQTIxNyZ0PUdESnk3dE5kdnBjOGgwYWktMQ=="

    var elementY02 = "aHR0cHM6Ly93d3cuZmlnbWEuY29tL2ZpbGUvYnNrTGs3MDAxUUt5dlNLbDVoTFc4RC9Hcm9jb20tLS1Gb29kLUUtY29tbWVyY2UtVGhlbWU/bm9kZS1pZD0xMjklM0E2MTEmdD02WkpuNXJOa2pWZTIweXVrLTE="

    if (localStorage.getItem("projectID") == "cultura") {
        var mixedElementY = atob(elementY00)
    } else if (localStorage.getItem("projectID") == "remotish") {
        var mixedElementY = atob(elementY01)
    } else if (localStorage.getItem("projectID") == "grocom") {
        var mixedElementY = atob(elementY02)
    } else {
        var mixedElementY = atob(elementY00)
    }

    window.location.href = mixedElementY
}
