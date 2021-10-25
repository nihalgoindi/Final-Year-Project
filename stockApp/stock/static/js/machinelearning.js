function updateGraphML(stock, timeperiod) {
    $.ajax({
        type: 'GET',
        url: "{% url 'machinelearning' stock=stock timeperiod=timeperiod %}",
        data: { "stock": stock, "timeperiod": timeperiod },
        success: function (response) {
            // if not valid user, alert the user
            if (!response["valid"]) {
                alert("failed");
            }
        },
        error: function (response) {
            console.log(response)
        }
    })
}

function machineRedirect(stock, timeperiod) {
    first = 'http://127.0.0.1:8000/%5Emachinelearning/(%3FP'.concat(stock)
    second = '%5Cw+)/(%3FP'.concat(timeperiod)
    third = '%5Cw+)/$'
    final = first.concat(second.concat(third))
    window.location.href = final
}

function helpTradDialog() {
    $("#tradhelpmodal").modal();
}

//document.getElementById("apptested").innerHTML = 'Hello world test'






