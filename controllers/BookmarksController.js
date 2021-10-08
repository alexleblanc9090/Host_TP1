const Repository = require('../models/Repository');
const url = require('url');

module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res) {
            super(req, res);
            this.BookmarksRepository = new Repository('bookmarks');
        }

        // Permet d'aller chercher tous les bookmarks.
        getAll() {
            this.response.JSON(this.BookmarksRepository.getAll());
        }

        getSearch(q) {
            let paramsInQuery = [];
            let valideParams = ['sort', 'name', 'category']
            let invalideParamFound = false;

            let allBookmarks = this.BookmarksRepository.getAll();

            var qData = q.query;
            var keys = Object.keys(qData);

            //Vérification de doublons au niveau des params acceptés et 
            //validation que les params dans la query sont des params acceptés
            keys.forEach(k => {
                if (!valideParams.includes(k) || paramsInQuery.includes(k))
                    invalideParamFound = true;
                paramsInQuery.push(k)
            });

            if (invalideParamFound)
                this.response.badRequest()


            //Filtrer par le nom...    
            if (keys.includes("name")) {
                let bookmarksToDelete = []
                let index = 0

                //Si la recherche contient une *
                if (qData['name'].includes('*')) {
                    let count = 0

                    for (var i = 0; i < qData['name'].length; i++) {
                        if (qData['name'].charAt(i) == "*")
                            count++;
                    }

                    if (count == 1) {
                        let indice = qData['name'].indexOf('*');

                        //startWith
                        if (indice != 0) {
                            let chars = qData['name'].substr(0, indice);
                            allBookmarks.forEach(bm => {
                                if (bm.Name.substr(0, indice).toLowerCase() != chars.toLowerCase())
                                    bookmarksToDelete.push(bm)
                            });

                            bookmarksToDelete.forEach(bm => {
                                index = allBookmarks.indexOf(bm);
                                allBookmarks.splice(index, 1)
                            });
                        }
                        else {
                            let chars = qData['name'].replace("*", "");

                            allBookmarks.forEach(bm => {
                                if (!bm.Name.toLowerCase().endsWith(chars.toLowerCase()))
                                    bookmarksToDelete.push(bm)
                            });

                            bookmarksToDelete.forEach(bm => {
                                index = allBookmarks.indexOf(bm);
                                allBookmarks.splice(index, 1)
                            });
                        }

                    }
                    else {
                        if (count > 2)
                            this.response.badRequest()


                        let index1 = qData['name'].indexOf("*") + 1;
                        let index2 = qData['name'].lastIndexOf("*")

                        let chars = qData['name'].slice(index1, index2).toLowerCase();

                        allBookmarks.forEach(bm => {
                            if (!bm.Name.toLowerCase().includes(chars))
                                bookmarksToDelete.push(bm)
                        });

                        bookmarksToDelete.forEach(bm => {
                            index = allBookmarks.indexOf(bm);
                            allBookmarks.splice(index, 1)
                        });

                    }

                }
                //Si la recherche est unique (pas * dans la query)
                else {
                    allBookmarks.forEach(bm => {
                        if (bm.Name.toLowerCase() != qData['name'].toLowerCase())
                            bookmarksToDelate.push(bm);
                    });

                    bookmarksToDelate.forEach(bm => {
                        index = allBookmarks.indexOf(bm);
                        allBookmarks.splice(index, 1)
                    });
                }
            }

            //Filtrer par la category
            if (keys.includes("category")) {
                let bookmarksToDelete = []
                let index = 0

                //Si la recherche contient une *
                if (qData['category'].includes('*')) {
                    let count = 0

                    for (var i = 0; i < qData['category'].length; i++) {
                        if (qData['category'].charAt(i) == "*")
                            count++;
                    }

                    if (count == 1) {
                        let indice = qData['category'].indexOf('*');

                        //startWith
                        if (indice != 0) {
                            let chars = qData['category'].substr(0, indice).toLowerCase();
                            allBookmarks.forEach(bm => {
                                if (bm.Category.substr(0, indice).toLowerCase() != chars)
                                    bookmarksToDelete.push(bm)
                            });

                            bookmarksToDelete.forEach(bm => {
                                index = allBookmarks.indexOf(bm);
                                allBookmarks.splice(index, 1)
                            });
                        }
                        else {
                            let chars = qData['category'].replace("*", "").toLowerCase();

                            allBookmarks.forEach(bm => {
                                if (!bm.Category.toLowerCase().endsWith(chars))
                                    bookmarksToDelete.push(bm)
                            });

                            bookmarksToDelete.forEach(bm => {
                                index = allBookmarks.indexOf(bm);
                                allBookmarks.splice(index, 1)
                            });
                        }

                    }
                    else {
                        if (count > 2)
                            this.response.badRequest()


                        let index1 = qData['category'].indexOf("*") + 1;
                        let index2 = qData['category'].lastIndexOf("*")

                        let chars = qData['category'].slice(index1, index2).toLowerCase();

                        allBookmarks.forEach(bm => {
                            if (!bm.Category.toLowerCase().includes(chars))
                                bookmarksToDelete.push(bm)
                        });

                        bookmarksToDelete.forEach(bm => {
                            index = allBookmarks.indexOf(bm);
                            allBookmarks.splice(index, 1)
                        });

                    }

                }
                //Si la recherche est unique (pas * dans la query)
                else {
                    allBookmarks.forEach(bm => {
                        if (bm.Category.toLowerCase() != qData['category'].toLowerCase())
                            bookmarksToDelate.push(bm);
                    });

                    bookmarksToDelate.forEach(bm => {
                        index = allBookmarks.indexOf(bm);
                        allBookmarks.splice(index, 1)
                    });
                }
            }
            
            //Si la query contient le params "sort"
            if (keys.includes("sort")) {
                if (qData['sort'] == "name") {
                    allBookmarks.sort(function (a, b) {
                        if (a.Name.toLowerCase() < b.Name.toLowerCase()) { return -1; }
                        if (a.Name.toLowerCase() > b.Name.toLowerCase()) { return 1; }
                        return 0;
                    })
                }
                else if (qData['sort'] == "category") {
                    allBookmarks.sort(function (a, b) {
                        if (a.Category.toLowerCase() < b.Category.toLowerCase()) { return -1; }
                        if (a.Category.toLowerCase() > b.Category.toLowerCase()) { return 1; }
                        return 0;
                    })
                }
                else {
                    this.response.badRequest();
                }
            }

            return allBookmarks;
        }

        //Permet d'aller chercher un bookmark en particulier.
        get(id) {

            var q = url.parse(this.req.url, true);

            console.log(q.host);
            console.log(q.pathname);
            console.log(q.search);

            if (!isNaN(id) && q.pathname === "/api/bookmarks/" + id.toString())
                this.response.JSON(this.BookmarksRepository.get(id));
            else if (q.search == null && q.pathname == "/api/bookmarks")
                this.response.JSON(this.BookmarksRepository.getAll());
            else if (q.search != null && q.pathname == "/api/bookmarks")
                this.response.JSON(this.getSearch(q));
            else
                this.response.badRequest();

        }

        post(bookmark) {
            let doublonName = false;
            let nameEmpty = false;
            let urlEmpty = false;
            let catEmpty = false;
            let invalidUrl = false;
            const myObj = this.BookmarksRepository.getAll();

            myObj.forEach(o => {
                if (o['Name'] == bookmark.Name)
                    doublonName = true;
            });

            if (bookmark['Name'] === "" || bookmark['Name'] === null || bookmark['Name'] === undefined)
                nameEmpty = true;

            if (bookmark['Url'] === "" || bookmark['Url'] === null || bookmark['Url'] === undefined)
                urlEmpty = true;

            if (bookmark['Category'] === "" || bookmark['Category'] === null || bookmark['Category'] === undefined)
                catEmpty = true;

            let pattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;


            if (!pattern.test(bookmark["Url"]))
                invalidUrl = true;

            if (invalidUrl || nameEmpty || catEmpty || urlEmpty ) {
                this.response.badRequest();
            }
            else if(doublonName)
            {
                this.response.conflict();
            }
            else {
                let newBookmark = this.BookmarksRepository.add(bookmark);
                if (newBookmark)
                    this.response.created(JSON.stringify(newBookmark));
                else
                    this.response.internalError();
            }
        }

        put(bookmark) {
            let doublonName = false;
            let nameEmpty = false;
            let urlEmpty = false;
            let catEmpty = false;
            let invalidUrl = false;
            const myObj = this.BookmarksRepository.getAll();

            //let obj = Object.keys(myObj);
            //Validation du champ Name pour doublon
            myObj.forEach(o => {
                if (o['Name'] == bookmark.Name)
                    if (o['Id'] != bookmark.Id)
                        doublonName = true;
            });

            if (bookmark['Name'] === "" || bookmark['Name'] === null || bookmark['Name'] === undefined)
                nameEmpty = true;

            if (bookmark['Url'] === "" || bookmark['Url'] === null || bookmark['Url'] === undefined)
                urlEmpty = true;

            if (bookmark['Category'] === "" || bookmark['Category'] === null || bookmark['Category'] === undefined)
                catEmpty = true;

            let pattern = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;


            if (!pattern.test(bookmark["Url"]))
                invalidUrl = true;

            if (invalidUrl || nameEmpty || catEmpty || urlEmpty) {
                //Update non fait.
                this.response.badRequest();
            }
            else if(doublonName){
                this.response.conflict();
            }
            else {
                if (this.BookmarksRepository.update(bookmark))
                    this.response.ok();
                else
                    this.response.notFound();
            }
        }

        //Supprime l'élément dans la "BD" où le Id est...
        remove(id) {
            if (this.BookmarksRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        }
    }