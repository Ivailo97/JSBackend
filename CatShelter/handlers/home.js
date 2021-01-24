const url = require('url');
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/' && req.method === 'GET') {
        const filePath = path.normalize(path.join(__dirname, '../views/home/index.html'));

        fs.readFile(filePath, (err, data) => {

            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                })

                res.write('Something went wrong');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            })


            fs.readFile('./data/cats.json', (err, cats) => {
                if (err) {
                    throw err;
                }

                let catsPlaceholder = JSON.parse(cats)
                    .map(cat => `<li><img src="${path.join('../content/images/' + cat.image)}" alt="${cat.name}">
                                        <h3>${cat.name}</h3>
                                        <p><span>Breed: </span>${cat.breed}</p>
                                        <p><span>Description: </span>${cat.description}</p>
                                        <ul class="buttons">
                                            <li class="btn edit"><a href="/cats/edit/${cat.id}">Change Info</a></li>
                                            <li class="btn delete"><a href="/cats/find-new-home/${cat.id}">New Home</a></li>
                                        </ul></li>`)
                    .reduce((arr, curr) => {
                        arr.push(curr);
                        return arr;
                    }, [])
                    .join('\n')

                let modifiedData = data.toString().replace('{{cats}}', catsPlaceholder);
                res.write(modifiedData);
                res.end();
            })
        })


    } else {
        return true;
    }
}