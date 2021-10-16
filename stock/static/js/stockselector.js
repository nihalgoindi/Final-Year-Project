$(function () {
    search.search();
    $('#daterange').daterangepicker({
        "showDropdowns": true,
        "autoApply": true,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        },
        "linkedCalendars": false,
        "alwaysShowCalendars": true,
        "startDate": moment().subtract(3, 'month'),
        "maxDate": moment(),
        "endDate": moment(),
        "opens": "center"
    }, function (start, end, label) {
        dateFrom = start.format('DD/MM/YYYY');
        dateTo = end.format('DD/MM/YYYY');
    });

    document.getElementById("searchField").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("srchbtn").click();
        }
    });
});


var dateTo = moment().format('DD/MM/YYYY');
var dateFrom = moment().subtract(3, 'MONTH').format('DD/MM/YYYY');

var search = new Vue({
    delimiters: ['[[', ']]'],
    el: '#searchResult',
    data: {
        items: [],
        selected: undefined,
        haveresults: true,
        errormsg: "Nothing Found",
    },
    computed: {
        stocks: function () {
            if (this.haveresults) {
                return this.items;
            }
        }
    },
    methods: {
        search: function () {
            axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
            axios.defaults.xsrfCookieName = "csrftoken";
            axios.post(srchURL, {
                params: {
                    searchField: document.getElementById('searchField').value,
                },
                headers: {
                    "X-CSRFToken": CSRF_TOKEN
                }
            }).then(response => {
                if (response.data['error'] != 0) {
                    this.haveresults = false;
                    this.items = [];
                    this.errormsg = response.data['data'];
                } else {
                    this.haveresults = true;
                    this.items = response.data['data'];
                }
            })
        }
    }
});

function helpSearchDialog() {
    $("#searchHelpDialog").modal();
}