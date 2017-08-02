
export default function csvExport (data, headers = []) {
    if (!headers.length) {
        for (var key in data[0]) {
            if (data[0].hasOwnProperty(key)) {
                headers.push(key);
            }
        }
    }
    const rows = [];
    data.forEach((row) => {
        rows.push(headers.map((k) => {
            return row[k];
        }).join(','));
    });
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(
      `${headers.join(',')}\n
      ${data.join('\n')}
      `);
    var downloadLink = document.createElement('a');
    downloadLink.href = uri;
    downloadLink.download = 'data.csv';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
