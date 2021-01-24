const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const formidable = require('formidable');
const appPath = 'C:\\Users\\HP\\Desktop\\CatShelter';

module.exports = (req, res) => {

    const pathname = url.parse(req.url).pathname;

    if (pathname === '/cats/add-cat' && req.method === 'GET') {
        const filePath = path.normalize(path.join(__dirname, '../views/addCat.html'));

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

            fs.readFile('./data/breeds.json', (err, breeds) => {
                if (err) {
                    throw err;
                }

                let catBreedPlaceholder = JSON.parse(breeds)
                    .map(breed => `<option value="${breed}">${breed}</option>`)
                    .reduce((arr, curr) => {
                        arr.push(curr);
                        return arr;
                    }, [])
                    .join('\n')

                let modifiedData = data.toString().replace('{{catBreeds}}', catBreedPlaceholder);
                res.write(modifiedData)
                res.end();
            })
        })

    } else if (pathname === '/cats/add-breed' && req.method === 'GET') {
        const filePath = path.normalize(path.join(__dirname, '../views/addBreed.html'));
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

            res.write(data)
            res.end();
        })
    } else if (pathname === '/cats/add-cat' && req.method === 'POST') {
        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) throw err;
            let oldPath = files.upload.path;
            let newPath = path.normalize(path.join(appPath, '/content/images/' + files.upload.name));

            fs.rename(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log('Files were moved succuessfully!')
            })

            fs.readFile('./data/cats.json', (err, data) => {
                if (err) throw err;

                let cats = JSON.parse(data);
                const newCat = { id: cats.length + 1, ...fields, image: files.upload.name }
                cats.push(newCat);
                let json = JSON.stringify(cats);
                fs.writeFile('./data/cats.json', json, () => {
                    res.writeHead(302, { location: '/' });
                    res.end();
                })
            })
        })


    } else if (pathname === '/cats/add-breed' && req.method === 'POST') {
        let formData = '';
        req.on('data', chunk => {
            formData += chunk.toString();
        });

        req.on('end', () => {
            let queryParams = qs.parse(formData);
            fs.readFile('./data/breeds.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let breeds = JSON.parse(data);
                breeds.push(queryParams.breed);
                let json = JSON.stringify(breeds);
                fs.writeFile('./data/breeds.json', json, 'utf-8', () => console.log('The breed was registered successfully!'))
            })

            res.writeHead(302, { location: '/' });
            res.end();
        });

    } else if (pathname.includes('/cats/edit') && req.method === 'GET') {
        const filePath = path.normalize(path.join(__dirname, '../views/editCat.html'));

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
                if (err) throw err;
                const currentCatId = +pathname.split('/')[3];
                let catToEdit = JSON.parse(cats).find(c => c.id === currentCatId);
                const breedsReadStream = fs.createReadStream('./data/breeds.json');
                breedsReadStream.on('error', (err) => {
                    res.end(err);
                });

                breedsReadStream.on('data', (breeds) => {
                    let breedOptions = JSON.parse(breeds)
                        .map(breed => `<option value="${breed}">${breed}</option>`)
                        .reduce((arr, curr) => {
                            arr.push(curr);
                            return arr;
                        }, []).join('\n')

                    let modifiedData = data.toString().replace('{{id}}', catToEdit.id);
                    modifiedData = modifiedData.replace('{{name}}', catToEdit.name);
                    modifiedData = modifiedData.replace('{{description}}', catToEdit.description);
                    modifiedData = modifiedData.replace('{{breeds}}', breedOptions);
                    res.write(modifiedData);
                    res.end();
                });
            })
        })

    } else if (pathname.includes('/cats/edit') && req.method === 'POST') {

        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) throw err;
            let oldPath = files.upload.path;
            let newPath = path.normalize(path.join(appPath, '/content/images/' + files.upload.name));

            fs.rename(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log('Files were moved succuessfully!')
            })

            fs.readFile('./data/cats.json', (err, data) => {
                if (err) throw err;
                const currentCatId = +pathname.split('/')[3];

                let cats = JSON.parse(data);
                const catToEditIndex = cats.findIndex(c => c.id === currentCatId);
                cats[catToEditIndex].name = fields.name;
                cats[catToEditIndex].description = fields.description;
                cats[catToEditIndex].breed = fields.breed;
                cats[catToEditIndex].image = files.upload.name;
                let json = JSON.stringify(cats);

                fs.writeFile('./data/cats.json', json, () => {
                    res.writeHead(302, { location: '/' });
                    res.end();
                })
            })
        })


    } else if (pathname.includes('/cats/find-new-home') && req.method === 'GET') {
        const filePath = path.normalize(path.join(__dirname, '../views/catShelter.html'));

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
                if (err) throw err;
                const currentCatId = +pathname.split('/')[3];
                let catToDelete = JSON.parse(cats).find(c => c.id === currentCatId);
                let modifiedData = data.toString().replace('{{id}}', catToDelete.id);
                modifiedData = modifiedData.replace('{{name}}', catToDelete.name);
                modifiedData = modifiedData.replace('{{description}}', catToDelete.description);
                modifiedData = modifiedData.replace('{{breed}}', catToDelete.breed);
                modifiedData = modifiedData.replace('{{breed}}', catToDelete.breed);
                modifiedData = modifiedData.replace('{{imageUrl}}', `${path.join('/../content/images/' + catToDelete.image)}`)
                res.write(modifiedData);
                res.end();
            })
        })

    } else if (pathname.includes('/cats/find-new-home') && req.method === 'POST') {
        fs.readFile('./data/cats.json', (err, data) => {
            if (err) throw err;
            const currentCatId = +pathname.split('/')[3];

            let cats = JSON.parse(data);
            cats = cats.filter(c => c.id !== currentCatId);
            let json = JSON.stringify(cats);

            fs.writeFile('./data/cats.json', json, () => {
                res.writeHead(302, { location: '/' });
                res.end();
            })
        })

    } else if (pathname.includes('/cats/search') && req.method === 'GET') {
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
                if (err) throw err;

                const reqUrl = url.parse(req.url);
                const params = qs.parse(reqUrl.query);

                let catsPlaceholder = JSON.parse(cats)
                    .filter(c => c.name.includes(params.query))
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