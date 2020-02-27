const fs = require('fs');

const writeStream = fs.createWriteStream('./geo.csv');

const leftTop = {lat: 31.273278, lng: 121.172273};
const bottomRight = {lat: 30.855291, lng: 121.697481};

function getRandomLatLng(leftTop, bottomRight) {
    const lngSpan = bottomRight.lng - leftTop.lng;
    const latSpan = leftTop.lat - bottomRight.lat;

    return {
        lat: bottomRight.lat + latSpan * Math.random(),
        lng: leftTop.lng + lngSpan * Math.random()
    };
}

function writeGeoToCSV() {
    for (let i=0; i< 92; i++) {
        const {lat, lng} = getRandomLatLng(leftTop, bottomRight);
        writeStream.write(`${lat},${lng}\n`);
    }
    writeStream.end();
    writeStream.on('finish', () => {
        console.log('done')
    }).on('error', (err) => {
        console.log(err)
    })
}

writeGeoToCSV();
