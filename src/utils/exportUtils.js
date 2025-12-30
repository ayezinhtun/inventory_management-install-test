export const exportToCSV = (data, filename = 'export.csv', headers = []) => {
    if(!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const escapeCSV = (val) => `"${(val ?? '').toString().replace(/"/g, '""')}"`;


    const csvContent = [
        //this is for header
        headers.join(','),

        //this is for data to show in the row
        ...data.map(row => headers.map(h => escapeCSV(row[h])).join(','))

    ].join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};

export const exportToPDF = (data, headers = [], title = 'Export') => {
    if(!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const rows = data.map(row => `
        <tr>
            ${headers.map(h => `<td>${row[h] ?? '-'}</td>`).join('')}
        </tr>
    `).join('');

    const html = `
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body {font-family: Arial, sans-serif; margin: 20px}
                    table {width: 100%; border-collapse: collapse}
                    th, td {border: 1px solid #ddd; padding: 5px; text-align: left}
                    th {background-color: #f5f5f5}
                </style>
            </head>
            <body>
                <h2>${title}</h2>
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </body>
        </html>
    `;

    const w = window.open('', '_blank');
    if(w) {
        w.document.write(html);
        w.document.close();


        //w.print to show the right print panel
        w.print();
    }else{
        alert('Popup blocked. Allow popups to print PDF');
    }
}