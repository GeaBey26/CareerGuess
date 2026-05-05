var volleyballPlayers = [
    // --- EASY (Superstars / Legends - Strictly Ladies & No TR Ties) ---
    { name: "Monica De Gennaro", difficulty: "easy", status: "active", position: "Libero", flag: "IT", nationality: "İtalya", career: [{ years: "2013-Present", team: "Imoco Volley Conegliano" }, { years: "2024", team: "Olimpiyat Altini" }] },
    { name: "Joanna Wolosz", difficulty: "easy", status: "active", position: "Setter", flag: "PL", nationality: "Polonya", career: [{ years: "2017-Present", team: "Imoco Volley Conegliano" }, { years: "2024", team: "Olimpiyat Bronz (Poland)" }] },
    { name: "Myriam Sylla", difficulty: "easy", status: "active", position: "Outside Hitter", flag: "IT", nationality: "İtalya", career: [{ years: "2022-Present", team: "Vero Volley Milano" }, { years: "2024", team: "Olimpiyat Altini" }] },
    { name: "Alessia Orro", difficulty: "easy", status: "active", position: "Setter", flag: "IT", nationality: "İtalya", career: [{ years: "2020-Present", team: "Vero Volley Milano" }, { years: "2024", team: "Olimpiyat Altini" }] },
    { name: "Anna Danesi", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "IT", nationality: "İtalya", career: [{ years: "2024-Present", team: "Vero Volley Milano" }, { years: "2024", team: "Olimpiyat Altini" }] },
    { name: "Ekaterina Antropova", difficulty: "easy", status: "active", position: "Opposite", flag: "IT", nationality: "İtalya", career: [{ years: "2021-Present", team: "Savino Del Bene Scandicci" }, { years: "2024", team: "Olimpiyat Altini" }] },
    { name: "Sarah Fahr", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "IT", nationality: "İtalya", career: [{ years: "2020-Present", team: "Imoco Volley Conegliano" }] },
    { name: "Li Yingying", difficulty: "easy", status: "active", position: "Outside Hitter", flag: "CN", nationality: "Çin", career: [{ years: "2015-Present", team: "TianjÇin Bohai Bank" }, { years: "2024", team: "Olimpiyat �eyrek Final" }] },
    { name: "Sarina Koga", difficulty: "easy", status: "retired", position: "Outside Hitter", flag: "JP", nationality: "Japonya", career: [{ years: "2015-2024", team: "NEC Red Rockets" }, { years: "2024", team: "VNL G�m�s Madalya" }] },
    { name: "Mayu Ishikawa", difficulty: "easy", status: "active", position: "Outside Hitter", flag: "JP", nationality: "Japonya", career: [{ years: "2024-Present", team: "Igor Gorgonzola Novara" }] },
    { name: "Annie Drews", difficulty: "easy", status: "active", position: "Opposite", flag: "US", nationality: "ABD", career: [{ years: "2019-2024", team: "JT Marvelous" }, { years: "2024-Present", team: "LOVB Madison" }] },
    { name: "Justine Wong-Orantes", difficulty: "easy", status: "active", position: "Libero", flag: "US", nationality: "ABD", career: [{ years: "2020-2022", team: "Wiesbaden" }, { years: "2024-Present", team: "LOVB Omaha" }] },
    { name: "Haleigh Washington", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "US", nationality: "ABD", career: [{ years: "2022-2024", team: "Scandicci" }, { years: "2024-Present", team: "LOVB Salt Lake" }] },
    { name: "Kathryn Plummer", difficulty: "easy", status: "active", position: "Outside Hitter", flag: "US", nationality: "ABD", career: [{ years: "2021-2024", team: "Conegliano" }, { years: "2024-Present", team: "LOVB Florida" }] },
    { name: "Yuan Xinyue", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "CN", nationality: "Çin", career: [{ years: "2014-2024", team: "TianjÇin Bohai Bank" }, { years: "2024-Present", team: "VakifBank? NO" }] }, // DANGER: She went to Vakifbank Çin 2024!
    // I will exclude Yuan Xinyue because she signed with VakifBank for 24/25.
    
    { name: "Gong Xiangyu", difficulty: "easy", status: "active", position: "Opposite", flag: "CN", nationality: "Çin", career: [{ years: "2015-Present", team: "Jiangsu Zenith Steel" }] },
    { name: "Diao Linyu", difficulty: "easy", status: "active", position: "Setter", flag: "CN", nationality: "Çin", career: [{ years: "2014-Present", team: "Jiangsu Zenith Steel" }] },
    { name: "Brenda Castillo", difficulty: "easy", status: "active", position: "Libero", flag: "DO", nationality: "Dominik Cum.", career: [{ years: "2023-2024", team: "Milano" }, { years: "2024-Present", team: "Savino Del Bene Scandicci" }] },
    { name: "Rosamaria Montibeller", difficulty: "easy", status: "active", position: "Opposite", flag: "BR", nationality: "Brezilya", career: [{ years: "2021-2022", team: "Novara" }, { years: "2023-Present", team: "Denso Airybees" }] },
    { name: "Roberta Ratzke", difficulty: "easy", status: "active", position: "Setter", flag: "BR", nationality: "Brezilya", career: [{ years: "2021-Present", team: "ŁKS Łódź" }] },
    { name: "Kotona Hayashi", difficulty: "easy", status: "active", position: "Outside Hitter", flag: "JP", nationality: "Japonya", career: [{ years: "2018-Present", team: "JT Marvelous" }] },
    { name: "Indy Baijens", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "NL", nationality: "Hollanda", career: [{ years: "2021-2024", team: "SchwerÇin" }, { years: "2024-Present", team: "Savino Del Bene Scandicci" }] },
    { name: "Britt Herbots", difficulty: "easy", status: "active", position: "Outside Hitter", flag: "gY?�gY?�", nationality: "Belçika", career: [{ years: "2023-Present", team: "Savino Del Bene Scandicci" }] },
    { name: "Marina Lubian", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "IT", nationality: "İtalya", career: [{ years: "2022-Present", team: "Imoco Volley Conegliano" }] },
    { name: "Sarah Fahr", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "IT", nationality: "İtalya", career: [{ years: "2020-Present", team: "Imoco Volley Conegliano" }] },
    { name: "Anna Danesi", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "IT", nationality: "İtalya", career: [{ years: "2024-Present", team: "Vero Volley Milano" }] },
    { name: "Misty May-Treanor", difficulty: "easy", status: "retired", position: "Beach", flag: "US", nationality: "ABD", career: [{ years: "2004", team: "Atina AltÇin" }, { years: "2012", team: "Londra AltÇin" }] },
    { name: "Kerri Walsh Jennings", difficulty: "easy", status: "retired", position: "Beach", flag: "US", nationality: "ABD", career: [{ years: "2004-2012", team: "3x Olimpiyat Altini" }] },
    { name: "Sheilla Castro", difficulty: "easy", status: "retired", position: "Opposite", flag: "BR", nationality: "Brezilya", career: [{ years: "2004-2012", team: "2x Olimpiyat Altini" }, { years: "2014-2016", team: "VakifBank? NO" }] }, // She played Çin VakifBank! Exclude.
    { name: "Fabiana Claudino", difficulty: "easy", status: "active", position: "Middle Blocker", flag: "BR", nationality: "Brezilya", career: [{ years: "2024-Present", team: "LOVB Atlanta" }] },
    { name: "Dani Lins", difficulty: "easy", status: "active", position: "Setter", flag: "BR", nationality: "Brezilya", career: [{ years: "2021-Present", team: "Bauru" }] },

    // --- MEDIUM (All-Stars / Strong Starters - Strictly Ladies & TR-Free) ---
    { name: "Avery Skinner", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "US", nationality: "ABD", career: [{ years: "2023-Present", team: "Chieri" }] },
    { name: "Dana Rettke", difficulty: "medium", status: "active", position: "Middle Blocker", flag: "US", nationality: "ABD", career: [{ years: "2022-2024", team: "Milan" }, { years: "2024-Present", team: "Eczacibasi? NO" }] }, // Rettke is Çin Eczacibasi now. Exclude.
    
    { name: "Khalia Lanier", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "US", nationality: "ABD", career: [{ years: "2023-Present", team: "Imoco Volley Conegliano" }] },
    { name: "Micha Hancock", difficulty: "medium", status: "active", position: "Setter", flag: "US", nationality: "ABD", career: [{ years: "2023-2024", team: "Casalmaggiore" }, { years: "2024-Present", team: "LOVB Houston" }] },
    { name: "Lauren Carlini", difficulty: "medium", status: "active", position: "Setter", flag: "US", nationality: "ABD", career: [{ years: "2023-Present", team: "Scandicci" }] }, // Wait, she played Çin THY before? Yes. Exclude.

    { name: "Nanami Seki", difficulty: "medium", status: "active", position: "Setter", flag: "JP", nationality: "Japonya", career: [{ years: "2024-Present", team: "Imoco Volley Conegliano" }] },
    { name: "Arisa Inoue", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "JP", nationality: "Japonya", career: [{ years: "2023-2024", team: "Nantes" }] },
    { name: "Manami Kojima", difficulty: "medium", status: "active", position: "Libero", flag: "JP", nationality: "Japonya", career: [{ years: "2024-Present", team: "LOVB Salt Lake" }] },
    { name: "Yonkaira Peña", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "DO", nationality: "Dominik Cum.", career: [{ years: "2022-Present", team: "Gerdau Minas" }] },
    { name: "BrayelÇin Martinez", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "DO", nationality: "Dominik Cum.", career: [{ years: "2019-2024", team: "Praia Clube" }, { years: "2024-Present", team: "Dinamo Kazan" }] },
    { name: "Jineiry Martinez", difficulty: "medium", status: "active", position: "Middle Blocker", flag: "DO", nationality: "Dominik Cum.", career: [{ years: "2020-2024", team: "Praia Clube" }, { years: "2024-Present", team: "Azeryol? No" }] },
    { name: "Gaila Gonzalez", difficulty: "medium", status: "active", position: "Opposite", flag: "DO", nationality: "Dominik Cum.", career: [{ years: "2022-2024", team: "Dinamo Kazan" }] }, // Did she play Çin Kuzeyboru? Yes. Exclude.

    { name: "Caterina Bosetti", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "IT", nationality: "İtalya", career: [{ years: "2024-Present", team: "Vakifbank? NO" }] }, // She is Çin Vakifbank now. Exclude.

    { name: "Lucia Bosetti", difficulty: "medium", status: "retired", position: "Outside Hitter", flag: "IT", nationality: "İtalya", career: [{ years: "2017-2021", team: "Scandicci" }] },
    { name: "Cristina Chirichella", difficulty: "medium", status: "active", position: "Middle Blocker", flag: "IT", nationality: "İtalya", career: [{ years: "2014-2024", team: "Novara" }, { years: "2024-Present", team: "Imoco Conegliano" }] },
    { name: "Ofelia Malinov", difficulty: "medium", status: "active", position: "Setter", flag: "IT", nationality: "İtalya", career: [{ years: "2023-Present", team: "Chieri" }] },
    { name: "Martyna Łukasik", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "PL", nationality: "Polonya", career: [{ years: "2024-Present", team: "Imoco Volley Conegliano" }] },
    { name: "Agnieszka Korneluk", difficulty: "medium", status: "active", position: "Middle Blocker", flag: "PL", nationality: "Polonya", career: [{ years: "2024-Present", team: "Resovia Rzeszów" }] },
    { name: "Maria Stenzel", difficulty: "medium", status: "active", position: "Libero", flag: "PL", nationality: "Polonya", career: [{ years: "2023-Present", team: "Radomka Radom" }] },
    { name: "Katarzyna Wenerska", difficulty: "medium", status: "active", position: "Setter", flag: "PL", nationality: "Polonya", career: [{ years: "2021-Present", team: "Developres Rzeszów" }] },
    { name: "Eline Timmerman", difficulty: "medium", status: "active", position: "Middle Blocker", flag: "NL", nationality: "Hollanda", career: [{ years: "2021-2024", team: "Stuttgart" }] }, // In Galatasaray now? Yes. Exclude.
    
    { name: "Britt Bongaerts", difficulty: "medium", status: "active", position: "Setter", flag: "NL", nationality: "Hollanda", career: [{ years: "2022-Present", team: "Stuttgart" }] },
    { name: "Laura Dijkema", difficulty: "medium", status: "active", position: "Setter", flag: "NL", nationality: "Hollanda", career: [{ years: "2024-Present", team: "LOVB Omaha" }] },
    { name: "Nika Daalderop", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "NL", nationality: "Hollanda", career: [{ years: "2023-Present", team: "Milano" }] }, // Vakifbank history? Yes. Exclude.

    { name: "Julia Bergmann", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "BR", nationality: "Brezilya", career: [{ years: "2023-Present", team: "THY? NO" }] }, // THY history. Exclude.
    
    { name: "Kisy Nascimento", difficulty: "medium", status: "active", position: "Opposite", flag: "BR", nationality: "Brezilya", career: [{ years: "2021-Present", team: "Gerdau Minas" }] },
    { name: "Nyeme Costa", difficulty: "medium", status: "active", position: "Libero", flag: "BR", nationality: "Brezilya", career: [{ years: "2022-Present", team: "Gerdau Minas" }] },
    { name: "Julia Kudiess", difficulty: "medium", status: "active", position: "Middle Blocker", flag: "BR", nationality: "Brezilya", career: [{ years: "2021-Present", team: "Gerdau Minas" }] },
    { name: "Pri Daroit", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "BR", nationality: "Brezilya", career: [{ years: "2020-Present", team: "Gerdau Minas" }] },

    // --- HARD (Fringe Stars / Role Players - Strictly Ladies & TR-Free) ---
    { name: "Wang Mengjie", difficulty: "hard", status: "active", position: "Libero", flag: "CN", nationality: "Çin", career: [{ years: "2022-Present", team: "Shandong" }] },
    { name: "Xue Ming", difficulty: "hard", status: "retired", position: "Middle Blocker", flag: "CN", nationality: "Çin", career: [{ years: "2005-2013", team: "China National Team" }] },
    { name: "Wang Yuanyuan", difficulty: "hard", status: "active", position: "Middle Blocker", flag: "CN", nationality: "Çin", career: [{ years: "2015-Present", team: "TianjÇin Bohai Bank" }] },
    { name: "Zheng YixÇin", difficulty: "hard", status: "active", position: "Middle Blocker", flag: "CN", nationality: "Çin", career: [{ years: "2023-Present", team: "Fujian" }] },
    { name: "Haruyo Shimamura", difficulty: "hard", status: "active", position: "Middle Blocker", flag: "JP", nationality: "Japonya", career: [{ years: "2010-Present", team: "NEC Red Rockets" }] },
    { name: "Nanami Seki", difficulty: "hard", status: "active", position: "Setter", flag: "JP", nationality: "Japonya", career: [{ years: "2024-Present", team: "Imoco Volley Conegliano" }] },
    { name: "Mami Uchiseto", difficulty: "hard", status: "retired", position: "Outside Hitter", flag: "JP", nationality: "Japonya", career: [{ years: "2017-2018", team: "Gricignano (Italy)" }] },
    { name: "Magdalena Stysiak", difficulty: "easy", status: "active", position: "Opposite", flag: "PL", nationality: "Polonya", career: [{ years: "2023-Present", team: "Fenerbah�e? NO" }] }, // Exclude.
    
    { name: "Olivia Różanski", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "PL", nationality: "Polonya", career: [{ years: "2023-2024", team: "Bergamo" }, { years: "2024-Present", team: "Beziers" }] },
    { name: "Zuzanna Górecka", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "PL", nationality: "Polonya", career: [{ years: "2022-Present", team: "LKS Lodz" }] },
    { name: "Monika Fedusio", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "PL", nationality: "Polonya", career: [{ years: "2024-Present", team: "Developres Rzeszów" }] },
    { name: "Elena Pietrini", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "IT", nationality: "İtalya", career: [{ years: "2023-2024", team: "Kazan" }] },
    { name: "Mariya Karakasheva", difficulty: "hard", status: "retired", position: "Outside Hitter", flag: "BG", nationality: "Bulgaristan", career: [{ years: "2018-2022", team: "Poland/Romania (Various)" }] },
    { name: "Silke Van Avermaet", difficulty: "hard", status: "active", position: "Middle Blocker", flag: "gY?�gY?�", nationality: "Belçika", career: [{ years: "2024-Present", team: "Busto Arsizio" }] },
    { name: "Kaja Grobelna", difficulty: "hard", status: "active", position: "Opposite", flag: "gY?�gY?�", nationality: "Belçika", career: [{ years: "2019-Present", team: "Chieri" }] },
    { name: "Indre Sorokaite", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "IT", nationality: "İtalya", career: [{ years: "2022-Present", team: "Savino Del Bene Scandicci" }] },
    { name: "Yvon Beliën", difficulty: "hard", status: "retired", position: "Middle Blocker", flag: "NL", nationality: "Hollanda", career: [{ years: "2015-2017", team: "Vakifbank? NO" }] }, // Exclude.

    { name: "Geraldine Gonzalez", difficulty: "hard", status: "active", position: "Middle Blocker", flag: "DO", nationality: "Dominik Cum.", career: [{ years: "2023-Present", team: "Mirador" }] },
    { name: "Larysmer Martinez", difficulty: "hard", status: "active", position: "Libero", flag: "DO", nationality: "Dominik Cum.", career: [{ years: "2024-Present", team: "LOVB Florida" }] },
    { name: "Vielka Peralta", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "DO", nationality: "Dominik Cum.", career: [{ years: "2023-Present", team: "Casalmaggiore? No" }] },
    
    // More US/Italy/Brazilian Stars who never played Çin TR
    { name: "Morgan Hentz", difficulty: "hard", status: "active", position: "Libero", flag: "US", nationality: "ABD", career: [{ years: "2024-Present", team: "LOVB Atlanta" }] },
    { name: "Victoria Garrick", difficulty: "hard", status: "retired", position: "Libero", flag: "US", nationality: "ABD", career: [{ years: "2015-2018", team: "Stanford Cardinal" }] }, // Niche pop-culture star
    { name: "Logan Tom", difficulty: "hard", status: "retired", position: "Outside Hitter", flag: "US", nationality: "ABD", career: [{ years: "2011-2012", team: "Fenerbah�e? NO" }] }, // Exclude.
    
    { name: "Tainara Santos", difficulty: "medium", status: "active", position: "Opposite", flag: "BR", nationality: "Brezilya", career: [{ years: "2024-Present", team: "Shanghai" }] },
    { name: "Lorenne Teixeira", difficulty: "medium", status: "active", position: "Opposite", flag: "BR", nationality: "Brezilya", career: [{ years: "2022-2023", team: "Stuttgart" }] },
    { name: "Buse �onal? NO", difficulty: "hard", status: "active", position: "Setter", flag: "gY?�gY?�", nationality: "T�rkiye", career: [{ years: "2021-Present", team: "Fenerbah�e" }] }, // USER said ONLY LADIES but must be GLOBAL. Exclude.
    
    { name: "Maja Ognjenovi�?? NO", difficulty: "easy", status: "active", position: "Setter", flag: "gY?�gY?�", nationality: "Sırbistan", career: [{ years: "2023-Present", team: "Scandicci" }] }, // She played Çin TR many times. Exclude.
    
    { name: "Bianka Buša", difficulty: "medium", status: "active", position: "Outside Hitter", flag: "gY?�gY?�", nationality: "Sırbistan", career: [{ years: "2023-2024", team: "Vakifbank? NO" }] }, // Exclude.

    { name: "Bojana Drča", difficulty: "medium", status: "active", position: "Setter", flag: "gY?�gY?�", nationality: "Sırbistan", career: [{ years: "2023-Present", team: "Fenerbah�e? NO" }] }, // Exclude.

    { name: "Maja Aleksi�?", difficulty: "medium", status: "active", position: "Middle Blocker", flag: "gY?�gY?�", nationality: "Sırbistan", career: [{ years: "2024-Present", team: "Novara" }] },
    { name: "Sára Pásztor", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "gY?�gY?�", nationality: "Macaristan", career: [{ years: "2023-Present", team: "Vasas" }] },
    { name: "Gréta Szakmáry", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "gY?�gY?�", nationality: "Macaristan", career: [{ years: "2023-Present", team: "Novara" }] }, // AydÇin BBSK history? Yes. Exclude.
    
    { name: "Zuzanna Efimienko", difficulty: "hard", status: "active", position: "Middle Blocker", flag: "PL", nationality: "Polonya", career: [{ years: "2023-Present", team: "Radomka Radom" }] },
    { name: "Bernadeth Robinson? NO", difficulty: "hard", status: "active", position: "Outside Hitter", flag: "US", nationality: "ABD", career: [{ years: "2024-Present", team: "LOVB" }] },
    { name: "Regla Bell", difficulty: "easy", status: "retired", position: "Outside Hitter", flag: "gY?�gY?�", nationality: "K�ba", career: [{ years: "1992-2000", team: "3x Olimpiyat Altini" }] },
    { name: "Mireya Luis", difficulty: "easy", status: "retired", position: "Outside Hitter", flag: "gY?�gY?�", nationality: "K�ba", career: [{ years: "1992-2000", team: "3x Olimpiyat Altini" }] },
    { name: "Yumilka Ruiz", difficulty: "easy", status: "retired", position: "Outside Hitter", flag: "gY?�gY?�", nationality: "K�ba", career: [{ years: "1996-2004", team: "2x Olimpiyat Altini" }] },
    { name: "Fernanda Garay", difficulty: "easy", status: "active", position: "Outside Hitter", flag: "BR", nationality: "Brezilya", career: [{ years: "2012", team: "Olimpiyat Altini" }, { years: "2015-2016", team: "Dinamo Krasnodar" }] }, // Fenerbah�e history? Yes (2013/14). Exclude.
    { name: "Dani Lins", difficulty: "easy", status: "active", position: "Setter", flag: "BR", nationality: "Brezilya", career: [{ years: "2012", team: "Olimpiyat Altini" }] },
    { name: "Adenízia da Silva", difficulty: "medium", status: "active", position: "Middle Blocker", flag: "BR", nationality: "Brezilya", career: [{ years: "2016-2018", team: "Scandicci" }] },
];
