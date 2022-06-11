const chart = document.getElementById('myChart');
const div = document.querySelector('div.row');
const colors = document.body.dataset.colors.split(',');
const stats = JSON.parse(document.body.dataset.stats);
const metrics = ['avg_time_to_merge', 'median_time_to_merge'];

const getChartConfig = (title, data) => {
    return {
        type: 'doughnut',
        data: data,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: false
            }
        }
    };
}

for (const metric of metrics) {
    const data = {
        datasets: [{
            data: [],
            backgroundColor: colors,
            label: metric
        }],
        labels: [],
    };

    for (const user in stats) {
        data.datasets[0].data.push(stats[user][metric]);
        data.labels.push(user);
    }

    const innerDiv = document.createElement('div');
    const canvas = document.createElement('canvas');
    innerDiv.classList.add('col-4');
    innerDiv.append(canvas);
    div.append(innerDiv);

    const title = metric.split('_').map(word => word.toLocaleUpperCase()).join(' ');
    const myChart = new Chart(
        canvas,
        getChartConfig(title, data),
    );
}
