$(document).ready(function(){

    // Global variables
    //
    var gSearchLang = "";
    var gSearchString = "";


// search word
// search language
// translate sorting format
// translate language
// Explain word
// Explaing language


    var scrolled = 0;
    var Langs = new Array();

    // set up Personal list of favorit Languages and sort it
    var personalLangs = new Array("en","es","ca","ast","an","la","simple","oc","af","fr","it","nl","gl","eu","ext","frp","pt");
    // var personalLangs = JSON.parse(localStorage.getItem('preferredLang'));

    // var personalLangs = new Array();
    personalLangs.sort();

    // localStorage.setItem('preferredLang',JSON.stringify(personalLangs));

    var LangListByAlpha = new Array();
    var LangAbbrv = new Object();
    var listWikiLang = new Object();
    var langFamList = new Object();
    var langSubFamList = new Object();

    var LangListByWikiSize = new Array();
    var LangListByLangFamily = new Array();

    setupLangs();
    loadRandomPage();
    setVerticalGrid();

    // ******* SETTING-UP  ********* //

    function setLayout(){
        setSearchHeight();
        setTranslateHeight();
        setExplainHeight();
        setReviewHeight();

        setVerticalGrid();

        contentwrapper.style.width = window.innerWidth;
    }


    function setSearchHeight(){
        var offsetHeight = window.innerHeight -  $("#navHead").outerHeight(true) + "px";
        searchResults.style.height = offsetHeight;
    }

    function setTranslateHeight(){
        var offsetHeight = window.innerHeight -  $("#navHead").outerHeight(true) - $("#translatedWord").outerHeight(true) + "px";
        listResults.style.height = offsetHeight;
    }

    function setExplainHeight(){
        var offsetHeight = window.innerHeight -  $("#navHead").outerHeight(true) - $("#subheaderExplain").outerHeight(true)  +  "px";
        contentBlocks.style.height = offsetHeight;
    }


    function setReviewHeight(){
        var offsetHeight = window.innerHeight -  $("#navHead").outerHeight(true)  + "px";
        historyList.style.height = offsetHeight;
    }

    function setVerticalGrid(){
        resultingWidth = window.innerWidth - $("#navCol").outerWidth(true) - $("#searchCol").outerWidth(true)  - $("#translateCol").outerWidth(true) - $("#reviewCol").outerWidth(true) + "px" ;
        explainCol.style.width = resultingWidth;
    }

    window.onresize = function(event) {
        setLayout();
    }


    // *******  EVENT-DRIVEN FUNCTIONS  ********* //

    $("#logoButton").click(function(){
        loadRandomPage();
    });

    // >>>>>>>>>>>>>    SEARCH events

   $('input[type=text]').click(function() {
        $(this).select();
    });

    $(document).keypress(function(e){
        var $searchString = $('#searchSting');
        var character = String.fromCharCode(e.which);
        if ($searchString.is(':focus')){
            if ( e.which == 13 ){
                translateWord();
                fillContent();
                tempString = $searchString.val();
                $searchString.val(tempString + ' ');
            };
        } else {
            tempString = $searchString.val();
            $searchString.val(tempString + ' ');
            $searchString.focus();
        };
    });

    $(document).keyup(function(e){
        // CapitalizedString = capitalise($('#searchString').val());
        // ('#searchString').val(CapitalizedString);
        var searchTerm = $('#searchString').val();
        var searchLang = getSearchLang();
        searchAhead(searchTerm, searchLang);
    });

    $('#searchResults').on('click','a',function(){
        var pageName = $(this).text();
        $('#searchString').val(pageName);
        translateWord();
        fillContent();
    });

    $("#searchLang").change(function() {
        var searchTerm = $('#searchString').val();
        var searchLang = getSearchLang();
        searchAhead(searchTerm, searchLang);
        translateWord();
        fillContent();
    });

    // >>>>>>>>>>>>>  TRANSLATE events

    $("#sortBy").change(function() {
        //alert( "language changed!" );
        translateWord();
        //fillContent();
    });

    $("#translatedWord").on("click","a",function(event){
        event.preventDefault();
        var pageName = $(this).text();
        var wikiLang = $(this).attr("id")
        fillContent(pageName,wikiLang);
    });

    $('#listResults').on("mouseenter",'.transAbbrvLink',function(){
        var fullLangName = $(this).attr("fulllang");
        $(this).text(fullLangName);
        // console.log(fullLangName);
    });

    $('#listResults').on("mouseleave",'.transAbbrvLink',function(){
        var abbrvlLangName = $(this).attr("lang");
        $(this).text(abbrvlLangName);
        // console.log(fullLangName);
    });

    $('#listResults').on("mouseenter",'.transAbbrvLinkPersonal',function(){
        var fullLangName = $(this).attr("fulllang");
        $(this).text(fullLangName);
        // console.log(fullLangName);
    });

    $('#listResults').on("mouseleave",'.transAbbrvLinkPersonal',function(){
        var abbrvlLangName = $(this).attr("lang");
        $(this).text(abbrvlLangName);
        // console.log(fullLangName);
    });

    $('#listResults').on("click",'.langLink',function(){
        var pageName = $(this).text();
        var wikiLang = $(this).attr("id")
        fillContent(pageName,wikiLang);
    });

    $('#listResults').on("click",'.transAbbrvLink',function(){
        langAbbr = $(this).text();
        personalLangs.push(langAbbr);
        $(this).attr('class','transAbbrvLinkPersonal');
    });

    $('#listResults').on("click",'.transAbbrvLinkPersonal',function(){
        var langAbbr = $(this).text();
        var index = personalLangs.indexOf(langAbbr);
        personalLangs.splice(index,1);
        $(this).attr('class','transAbbrvLink');
    });


// >>>>>>>>>>>>>>>> EXPLAIN events

    $("#subheaderExplain").on("click", '#translateWikipage' , function(){
        var pageName = $(this).find("span").attr("id");
        var pageLang =  $(this).find("span").attr("id2");

        $("#searchString").val(pageName);
        $("#searchLang").val(pageLang);
        searchAhead(pageName,pageLang);
        translateWord(pageName,pageLang);
        fillContent(pageName,pageLang);
    });


    // intercept clicks on pageContent div //
    $("#pageContent").click(function(event){
        if(event.target.tagName.toLowerCase() == 'a'){
            var title = event.target.title;
            // explain title in abbrvLang
            fillContent(title);
            return false;
        }else{
        }
    });

    $("#wikiLinks").click(function(event){
        if(event.target.tagName.toLowerCase() == 'a'){
             var pageName = $(event.target).attr('id');
            fillContent(pageName,'en');
        }
        return false;
    });

    // >>>>>>>>>>>>>>>> DEFINE with wiktionary

    $("#definition").on("click","a",function(){
        var pageName = $(this).text();
        var wikiLang = $(this).attr("idLang")
        displayWiktionaryPage(pageName,wikiLang);
    });

    // >>>>>>>>>>>>>>> REVIEW

    $('#historyList').on('click','a',function(){
        if (event.target.className == ('langLink')){
            var pageName = $(this).text();
            var wikiLang = $(this).attr("id")
            fillContent(pageName,wikiLang);
        }
    });

    $('#clearHistory').on('click',function(){
        $('#historyList').empty();
    });

    // *******  FUNCTIONS  ********* //

    // LANGUAGE LIST FUNCTIONS //


    function setupLangs(){
        var file = "https://googledrive.com/host/0B_O653No3NwoQUZmQkNYajZLdTg/langConf.xml";
        $.get(file,function(data){
            $(data).find("ooo_row").each(function(i){
                var $lang = $(this);
                Rank_WikiSize = $lang.find('Rank_WikiSize').text(); // rank based on the size of that language wikipedia
                Rank_Alpha = $lang.find('Rank_Alpha').text(); // rank based on alphabetical sorting of all wikipedia languages
                Language = $lang.find('Language').text(); // full name of the language
                Articles_count = $lang.find('Articles_count').text(); // amount of articles contained
                Language_local = $lang.find('Language_local').text(); // name of language in local language
                WikiLang = $lang.find('WikiLang').text(); // abbreviated name of language
                LangSubfamily = $lang.find('LangSubfamily').text(); // language subfamily
                Rank_SubFamily = $lang.find('Rank_SubFamily').text(); // Rank of subfamily
                LangFamily = $lang.find('LangFamily').text(); // language family
                Rank_Family = $lang.find('Rank_Family').text(); // rank within family
                /* add values to global array Langs[] */
                Langs[i] = [Rank_WikiSize, Rank_Alpha, Language, Articles_count, Language_local, WikiLang, LangSubfamily, Rank_SubFamily, LangFamily, Rank_Family];
                LangAbbrv[WikiLang] = Language;
                listWikiLang[WikiLang] = Rank_WikiSize;
                langFamList[WikiLang] = Rank_Family;
                langSubFamList[WikiLang] = Rank_SubFamily;
                LangListByAlpha[i] = [WikiLang, Number(Rank_Alpha)];
                LangListByWikiSize[i] = [WikiLang, Number(Rank_WikiSize)];
                LangListByLangFamily[i] = [WikiLang, Number(Rank_Family)];
                // LangListBySubLangFamily[i] = [WikiLang, Number(Rank_SubFamily)];
            });
            // sort lists
             LangListByAlpha = LangListByAlpha.sort(function(a,b){
                return a[1] - b[1];
            });
            LangListByWikiSize = LangListByWikiSize.sort(function(a,b){
                return a[1] - b[1];
            });
            LangListByLangFamily = LangListByLangFamily.sort(function(a,b){
                return a[1] - b[1];
            });
            addLanguages();
        });
    }


    function getLangList(sortedBy){
        var i;
        for (i=0;iLangs.length;i++){
            switch (sortedBy){
                case 'alpha':
                // Sort by LANGUAGE ALPHABET
                case 'wikiSize':
                // Sort by SIZE OF WIKIPEDIA
                case 'familyLang':
                // Sort by LANGUAGE FAMILY
            }
        }
        return (sortedList);
    }


    function findLangAbbr(abbr) {
        fullName = LangAbbrv[abbr];
        return (fullName)
    }


    // add language list in search language pull down //
    function addLanguages(){
        var i;
        var length = lengthArray(LangListByAlpha);
        for (i=0;i<length;i++){
            var abbrev = LangListByAlpha[i][0];
            var Lang = findLangAbbr(abbrev) + ' (' + abbrev + ')';
            $("#searchLang").append(new Option(Lang,abbrev));
        }
        $("#searchLang").val("en");
    }

    // GENERAL FUNCTIONS PAGE //

        function updateUniqueURL(){
            // https://rosspenman.com/pushstate-jquery/
            // ask all modules for their variables
            // string them together
            // add them to the URL
            // SAMPLE: history.pushState({id: 'uniqueIDhere'}, '', 'feliciano&id=venado&ls=ca&33405734573498534');

        }



        function capitalise(str) {
            var split = str.split(" ");
            var result = new Array();
            for (i = 0, len = split.length; i < len; i++) {
                component = split[i];
                result.push(component.substring(0, 1).toUpperCase());
                result.push(component.substring(1));
                if (i < (len-1)){
                    result.push(" "); // put space back in except the final space
                }
            }
            var newString = result.join("");
            return newString;
        };

        // measure the lenght of an array object
        function lengthArray(obj) {
            var c = 0;
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) ++c;
            }
            return c;
        }


    // FUNCTIONS LOAD PAGE //

    function loadRandomPage(){
        // sandbox: https://en.wikipedia.org/wiki/Special:ApiSandbox#action=query&list=random&format=json&rnnamespace=0&rnlimit=1
        var lang = getSearchLang();
        var fullUrl = "https://" + lang + ".wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=1";
        $.ajax({
            type: "GET",
            url: fullUrl,
            contentType: "application/json",
            dataType: "jsonp",
            success: function(data){
                titlePage = data.query['random'][0].title;
                $("#searchString").val(titlePage);
                searchAhead(titlePage,lang);
                translateWord();
                fillContent();
            },
            error: function(){
            }
        });
    }

    // ****  GET WIKIPEDIA SEARCH RESULTS  ******

    // getSearchLang from search pull down
    function getSearchLang(){
        var lang = $("#searchLang").find(":selected").val();
        if (lang == null){
            return("en"); // EN is the default
        } else {
            return lang;
        };
    }

    function searchAhead(varName, varLang){
        // SAMPLE: https://en.wikipedia.org/w/api.php?format=json&action=query&list=allpages&apfrom=pie&aplimit=20
        //$("#searchResults").text("");

        // scroll up the div
        if ($('#searchResults').scrollTop() !=0){
            scrolled = scrolled - 300;
            $('#searchResults').stop().animate({
            scrollTop: scrolled
            });
        }

        if (varLang == null){
            var lang = getSearchLang();
        } else {
            var lang = varLang;
        };

        if (varName == null){
            var tempSearchResult = $("#searchString").val();
        } else {
            var tempSearchResult = varName;
        };

        // Capitalize all words
        tempSearchResult = capitalise(tempSearchResult);

        if (tempSearchResult.length > 0) {
            var fullUrl = "https://" + lang + ".wikipedia.org/w/api.php?format=json&action=query&list=allpages&apfrom=" + tempSearchResult + "&aplimit=100"
            var fullUrlXml = "https://" + lang + ".wikipedia.org/w/api.php?format=xml&action=query&list=allpages&apfrom=" + tempSearchResult + "&aplimit=100"
            $.ajax({
                type: "GET",
                url: fullUrl,
                contentType: "application/json",
                dataType: "jsonp",
                success: function(jsonData){
                    $("#searchResults").text("");
                    $.each(jsonData.query.allpages, function(i) {
                        var pageName = jsonData.query.allpages[i].title;
                        var pageId = jsonData.query.allpages[i].pageid;
                        $("#searchResults").append('<div class="searchResult"><a href="#" class="searchResultLink" pageid='+ pageId +' wikiLang="' + lang+'" >'+ pageName +'</a></div>');
                    });

                    // $("#searchResults").append('</br>[W.' +  lang + ']:<a href="' + fullUrlXml + '" target="_new">XML</a>|<a href="' + fullUrl + '" target="_new">JSON</a></br></br>');
                        setSearchHeight();
                },
               error: function(){
                    alert("Could not retrieve data.");
                }
            });

        } else {
            $("#searchResults").text("Sorry, the search string is empty");
        }
    }


    // ****  TRANSLATE  ******

    function translateWord(varName,varLang){

        $("#translatedWord").text("");
        $("#listResults").text("");

        //https://en.wikipedia.org/w/api.php?format=json&action=query&prop=langlinks&lllimit=100&titles=pie
        if (varLang == null){
            var lang = getSearchLang();
        } else {
            var lang = varLang;
        };

        if (varName == null){
            var PageName = $("#searchString").val();
        } else {
            var PageName = varName;
        };

        var fullUrl = "https://" + lang + ".wikipedia.org/w/api.php?format=json&action=query&prop=langlinks&lllimit=100&titles=" + $("#searchString").val() + "&redirects";
        var fullUrlXml = "https://" + lang + ".wikipedia.org/w/api.php?format=xml&action=query&prop=langlinks&lllimit=100&titles=" + $("#searchString").val() + "&redirects";

        var sortedList = new Array();
        $.ajax({
            type: "GET",
            url: fullUrl,
            contentType: "application/json",
            dataType: "jsonp",

            success: function(jsonData){
                $("#translatedWord").append('<span id="transWordLink"><b><a href="#" class="langLink" id="'+ lang +'">'+ PageName +'</a></b></span> from <span class="OriginLangTrans">' + findLangAbbr(lang) +'</span> to:');
                $.each(jsonData.query.pages, function(i, v) {
                    if ( v.langlinks != null) {
                        $.each(v.langlinks , function(x, h) {
                            // Extract language code and page name from JSON results
                            var wikiLang = v.langlinks[x].lang;
                            var wikiPageName = v.langlinks[x]["*"];

                            var wikiLangList = listWikiLang[wikiLang];
                            var famLangList = langFamList[wikiLang];
                            var subfamLangList = langSubFamList[wikiLang];

                            var alphaList = x.toString();
                            var temp = [wikiLang, wikiPageName, wikiLangList, alphaList, famLangList, subfamLangList];
                            sortedList.push(temp);
                        });
                        var sortingSetting = $("#sortBy").find(":selected").val();
                        switch (sortingSetting){

                            // SORT BY LANGUAGE ALPHABET
                            case 'alpha':
                                sortedList.sort(function(a,b){
                                    return a[3] - b[3];
                                });
                                var counter = 0;
                                for(i=0;i<personalLangs.length;i++){
                                    $.each(sortedList,function(t){
                                        if (sortedList[t][0] == personalLangs[i]){
                                            foundResult = sortedList[t];
                                            sortedList.splice(t,1); // remove '1' element from position 't'
                                            sortedList.splice(counter,0,foundResult); // add 'foundResult' to position 'counter' | remove '0' elements
                                            counter = counter + 1;
                                        }
                                    });
                                };

                                var i;
                                for (i = 0; i < sortedList.length; ++i) {
                                    var linkClass = 'transAbbrvLink';
                                    if (personalLangs.indexOf(sortedList[i][0]) != -1){
                                        linkClass = 'transAbbrvLinkPersonal';
                                    }else{
                                    };
                                    $("#listResults").append('<div class="langLabel"><a href="#" class="' + linkClass + '" fullLang="'+ findLangAbbr(sortedList[i][0])+'" lang="'+ sortedList[i][0] +'">' + sortedList[i][0] +'</a><a href="#" class="langLink" id="'+ sortedList[i][0] +'">'+ sortedList[i][1] +'</a></div>');
                                }
                            break;

                            // Sort by SIZE OF WIKIPEDIA
                            case 'wikiSize':
                                sortedList.sort(function(a,b){
                                return a[2] - b[2];
                                });
                                var i;
                                var previousWikisize = "";
                                for (i = 0; i < sortedList.length; ++i) {
                                    var tempLangID = sortedList[i][2] - 1;
                                    var tempWikiSize = Langs[tempLangID][3];
                                    if (tempWikiSize != previousWikisize){
                                        wikisizeLabelHTML = '<div class="resultCategory">'+ tempWikiSize +'</div>';
                                        previousWikisize = tempWikiSize;

                                    }else{
                                        wikisizeLabelHTML='';
                                    }
                                    $("#listResults").append(wikisizeLabelHTML + '<div class="langLabel"><a href="#" class="transAbbrvLink" lang="'+ sortedList[i][0] + '" fullLang="'+ findLangAbbr(sortedList[i][0]) + '" >' + sortedList[i][0] +'</a><a href="#" class="langLink" id="'+ sortedList[i][0] +'">'+ sortedList[i][1] +'</a></div>');
                                }
                            break;

                            // Sort by LANGUAGE FAMILY
                            case 'familyLang':
                                sortedList.sort(function(a,b){
                                    return a[4] - b[4];
                                });
                                var i;
                                var previousLangFamily = ''
                                for (i = 0; i < sortedList.length; ++i) {
                                    var tempLangID = sortedList[i][2]-1;
                                    var tempLangFamily = Langs[tempLangID][8]
                                    if (tempLangFamily != previousLangFamily){
                                        LangFamilyHTML= '<div class="resultCategory">' + tempLangFamily + '</div>' ;
                                        previousLangFamily = tempLangFamily;
                                    }else{
                                        LangFamilyHTML='';
                                    };
                                    $("#listResults").append(LangFamilyHTML + '<div class="langLabel"><a href="#" class="transAbbrvLink" lang="'+ sortedList[i][0] + '" fullLang="'+ findLangAbbr(sortedList[i][0]) + '" >' + sortedList[i][0] +'</a> <a href="#" class="langLink" id="'+ sortedList[i][0] +'">'+ sortedList[i][1] +'</a></div>');
                                }
                            break;

                            // Sort by SUBLANGUAGE FAMILY
                            case 'subFamilyLang':
                                sortedList.sort(function(a,b){
                                    return a[5] - b[5];
                                });
                                var i;
                                var previousLangFamily = '';
                                var previousSubLangFamily = '';
                                for (i = 0; i < sortedList.length; ++i) {
                                    var tempLangID = sortedList[i][2] - 1;

                                    // Familia
                                    var tempLangFamily = Langs[tempLangID][8];
                                    if (tempLangFamily != previousLangFamily){
                                        LangFamilyHTML= '<div class="langFamLabel">' + tempLangFamily + '</div>' ;
                                        previousLangFamily = tempLangFamily;
                                    }else{
                                        LangFamilyHTML='';
                                    }
                                    // Subfamilia
                                    var tempLangSubFamily = Langs[tempLangID][6]
                                    if (tempLangSubFamily != previousSubLangFamily){
                                        LangSubFamilyHTML= '<div class="langSubFamLabel">' + tempLangSubFamily + '</div>' ;
                                        previousSubLangFamily = tempLangSubFamily;
                                    }else{
                                        LangSubFamilyHTML='';
                                    };
                                    $("#listResults").append(LangFamilyHTML + LangSubFamilyHTML + '<div class="langLabel"><a href="#" class="transAbbrvLink" lang="'+ sortedList[i][0] + '" fullLang="'+ findLangAbbr(sortedList[i][0]) + '" >' + sortedList[i][0] +'</a><a href="#" class="langLink" id="'+ sortedList[i][0] +'">'+ sortedList[i][1] +'</a></div>');
                                }
                            break;


                        }
                    } else {
                    $("#listResults").append('<i>No translations available</i></br>');
                    }
                });

                // $("#listResults").append('</br>[W.' +  lang + ']<a href="' + fullUrlXml + '" target="_new">XML</a>|<a href="' + fullUrl + '" target="_new">JSON</a></br></br>');
                setTranslateHeight();
            },

            error: function(){
                alert("Could not retrieve data.");
            }
        });
    };



// ****  GET WIKIPEDIA CONTENT ******

    function fillContent(pageName,lang){
        $("#pageContent").text("");

        // scroll up the div when loading new content
        $("#contentBlocks").scrollTop(0);

        if (pageName == null){var pageName = $("#searchString").val();}
        if (lang == null){var lang = getSearchLang();}

        // https://en.wikipedia.org/w/api.php?action=parse&page=diesel&prop=text&format=json
        // https://en.wikipedia.org/w/api.php?format=xml&action=query&generator=allpages&gaplimit=1&gapfilterredir=nonredirects&gapfrom=Chanterelle&prop=revisions&rvprop=content

        var fullUrl = "https://" + lang +".wikipedia.org/w/api.php?action=parse&prop=text&format=json&redirects&page=" + pageName;
        var fullUrlXml = "https://" + lang +".wikipedia.org/w/api.php?action=parse&prop=text&format=xml&redirects&page=" + pageName;

        $.ajax({
            type:"GET",
            url: fullUrl,
            contentType: "application/json",
            dataType: "jsonp",
            success: function(jsonData){
                var htmlWikiText = jsonData["parse"]["text"]["*"];
                var $wikiText = $(jsonData["parse"]["text"]["*"]);

                // Calculate reading time (note: average word length ~ 5 | average words read per minute = 250-300)
                var rawWikiText = $wikiText.text();
                var readingTimeMins = ((rawWikiText.length/5)/250);
                $('#wikiReadingTime').text('( ' + Math.ceil(readingTimeMins) + ' min)');

                // **** Modify links ***
                $('#wikiLinks').html('');
                var linksArray = new Array();
                var linkCount = 0;
                var listLinks = $wikiText.find('a');
                var tempUniquelist = new Array();
                listLinks.each(function(idx,li){
                    var theLink = $(this).attr('href');
                    var theText = $(this).text();
                    if($.inArray(theLink,tempUniquelist)==-1){
                        if (theLink != null && theLink.indexOf("/wiki/")==0 && theLink.indexOf(':') === -1){
                            var tempArray = [theText,decodeURIComponent(theLink)];
                            linksArray.push(tempArray);
                            linkCount = linkCount +1;
                        };
                        tempUniquelist.push(theLink);
                    };
                });
                tempUniquelist=[];

                // Sort array alphabetically
                var sortedList = linksArray.sort(function(a,b){ return a[1] > b[1] ? 1 : -1; });
                var lastInitial = "";

                var listLength = sortedList.length;
                var HTMLstring = "";

                $.each(sortedList, function( value ) {
                    tempInitial = sortedList[value][1].charAt(6);
                    if (lastInitial != tempInitial){
                        if (value!=0){
                                HTMLstring += "</div>"
                            };
                        HTMLstring += '<div class="letterSection"><div class="conceptLinkTab">' + tempInitial + '</div></br>';
                        lastInitial = tempInitial;
                    };
                    wikiName = decodeURIComponent(sortedList[value][1].replace("/wiki/",""));
                    printedWikiName = decodeURIComponent(wikiName.replace(/_/g," "));
                    HTMLstring += '<div class="conceptLink"><a href="" id="' +  wikiName + '">' + printedWikiName + '</a></div>';
                    if (value == (listLength-1)){
                        HTMLstring += '</div>';
                    };
                });
                $('#wikiLinks').append(HTMLstring);
                $('#wikiConceptsCounter').text('(' + linkCount +')');

                // Collect Images
                $wikiImagesGallery = $("#wikiImagesGallery");
                $wikiImagesGallery.text("");
                var found = $("img", $wikiText);
                if (found != null){
                    $('#wikiImages').show();
                    for(u=0;u<found.length;u++){
                        var $found = $(found[u]);
                        var $Source = $found.attr('src');
                        var linkHTMLopen = '';
                        var linkHTMLclose = '';
                        var $srcSet = $found.attr('srcset');
                         if ($srcSet != null){
                            srcSetArray = $srcSet.split(" ");
                            fullRes = srcSetArray[2];
                            if (fullRes != null){
                                fullRes = fullRes.replace("//","http://");
                                var linkHTMLopen = '<a href=' + fullRes + ' target="new">';
                                var linkHTMLclose = '</a>';
                            }
                        }
                        $wikiImagesGallery.append('<div class="wikiImageFrame">'+ linkHTMLopen + '<img src="https:' + $Source + '" class="wikiImage"></img>'+ linkHTMLclose + '</div>');
                    }
                    $('#wikiImgCounter').text(' ('+found.length+')');
                } else {
                    $('#wikiImages').hide();
                    $('#wikiImgCounter').text(' (0)');
                }


                //Collect external links
                // var listLinks = document.getElementsByClassName("external text");
                // for each (var item in listLinks) {
                //     console.log(listLinks[item]);
                // }


                // // Collect Coordinates
                var geolocations = $wikiText.find('.geo-dec');
                $geoFrames = $('#geoFrames');
                $geoFrames.text('');

                if(geolocations.length>0){
                    for(u=0;u<geolocations.length;u++){
                        var oneLocation = $(geolocations[u]).text();
                        arrayLocation = oneLocation.split(" ");
                        var latitude = arrayLocation[0];
                        var longitude = arrayLocation[1];
                        var geoHTMLstring = '<div id="geoMap"><a href="https://www.google.com/maps/place/' + latitude + ' ' + longitude + '" target="new"> #'+ u+' : ' +  latitude + ', ' + longitude + '</a></div>';
                        $geoFrames.append(geoHTMLstring);
                    }
                    $('#wikiLocationsCounter').text('(' + geolocations.length + ')');
                    $('#wikiMaps').show();
                }else{
                    $('#wikiMaps').hide();
                    $('#wikiLocationsCounter').text(' (0)');
                }



                // Find titles
                var title = jsonData["parse"].title;
                // var text = $wikiText.replace(/src="\/\//g,'src="https://');
                var text = htmlWikiText;
                var text = text.replace(/src="\/\//g,'src="https://');
                var text = text.replace(/src="\/\//g,'src="https://');
                var text = text.replace(/srcset="\/\//g,'src="https://');
                var text = text.replace(/href="\/wiki/g,'href="https://'+lang+'.wikipedia.org/wiki');
                var wikipediaLink = "https://" + lang + ".wikipedia.org/wiki/" + pageName;
                $("#pageContent").append(text + "</br>");

                // Add header on top of translated page
                $subheaderExplain = $("#subheaderExplain");
                $subheaderExplain.text("");
                $subheaderExplain.append('<b><a href="'+ wikipediaLink + '" target="_new">' + title + '</a></b> in '+ findLangAbbr(lang) +'<b></b> ');
                $subheaderExplain.append('<a id="translateWikipage" href="#"><span id="'+ title +'" id2="'+ lang +'">[translate]</span></a>');

                //Set pixel height of explain Div
                setExplainHeight();
            },
            error: function(){
                alert("Could not retrieve data.");
            }
        });
        // end of ajax function


        // fill the review columns
        $("#historyList").prepend('<div class="langLabel2"><a class="langAbbrNoLink" href="#">' + lang +'</a><a href="#" class="langLink" id="'+ lang +'">'+ pageName +'</a></div>');
        setReviewHeight();

        // Look for wiktionary page of 'pageName'
        displayWiktionaryPage(pageName,lang);
    }




     // ****  GET WIKTIONARY CONTENT ******

    function displayWiktionaryPage (pageName,lang){
        var dictPageName = pageName.toLowerCase();

        if (lang == null){
            var lang = getSearchLang();
        }

        var fullDictUrl = "https://" + lang +".wiktionary.org/w/api.php?action=parse&prop=text&format=json&redirects&page=" + dictPageName;
        var fullDictUrlXml = "https://" + lang +".wiktionary.org/w/api.php?action=parse&prop=text&format=xml&redirects&page=" + dictPageName;
        var wiktionaryLink = "https://" + lang + ".wiktionary.org/wiki/" + pageName;

        $("#definition").text("");

        $.ajax({
            type:"GET",
            url: fullDictUrl,
            contentType: "application/json",
            dataType: "jsonp",
            success: function(jsonData2){
                if (jsonData2["parse"]){
                    var textDefinition = (" " + jsonData2["parse"].text["*"] + " ");
                    var textFinal = textDefinition.replace(/src="\/\//g,'src="https://');
                    var dictTitle = jsonData2["parse"].title;
                    $("#definedWord").text("");
                    $("#definedWord").append('<b><a href="'+ wiktionaryLink +'" target="_new">' + dictTitle + '</a></b> in '+ findLangAbbr(lang) +' <a href="#"> [Translate]</a> ');
                    $("#definition").append(textFinal + "</br>");
                    $('#wikiDefineCounter').text('(1)');
                } else {
                    $("#definedWord").text("");
                    $("#definedWord").append('<b><a href="'+ wiktionaryLink +'" target="_new">' + dictPageName + '</a></b> in '+ findLangAbbr(lang) +' <a href="#"> [Translate]</a>');
                    $("#definition").append("<i>This word is not defined yet in the ("+  lang  +") wiktionary.</i></br></br>");
                    $('#wikiDefineCounter').text('(0)');

                    // suggest pages //
                    // https://en.wiktionary.org/w/api.php?format=json&action=query&list=allpages&apfrom=cod10&aplimit=40
                    // https://en.wiktionary.org/w/api.php?action=opensearch&search=api&limit=10&namespace=0&format=jsonfm

                    openSearchURL = "https://" + lang + ".wiktionary.org/w/api.php?format=json&action=query&list=allpages&apfrom=" + dictPageName + "cod10&aplimit=20";
                    //$("#definition").append('Link: <a href="' + openSearchURL +'">open search</a>')

                    $.ajax({
                        type:"GET",
                        url: openSearchURL,
                        contentType: "application/json",
                        dataType: "jsonp",
                        success: function(jsonData){
                            $("#definition").append("Suggested words:</br>");
                            $.each(jsonData.query.allpages, function(i, v) {
                                var pageName = jsonData.query.allpages[i].title;
                                var pageId = jsonData.query.allpages[i].pageid;
                                $("#definition").append('<a href="#" idLang="'+ lang +'">' +pageName + '</a></br>');
                            });

                            // $("#definition").append('</br>[W.' +  lang + ']: <a href="'+ fullDictUrl +'" target="_new"> JSON </a> - <a href="' + fullDictUrlXml + '" target="_new"> XML </a></br></br>');
                            // setDefineHeight();
                        },
                        error: function(){
                        }
                    });

                }
            },
            error: function(){
                $("#definedWord").append("Couldn't find " + dictTitle + " in the wiktionary");
                $('#wikiDefineCounter').text('(0)');
            }
        });
    }


});
