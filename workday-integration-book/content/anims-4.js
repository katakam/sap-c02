(function(){
var A=BOOK.A;

A({id:"a-req-to-report",title:"From requirement to report, step by step",sum:"How a new consultant turns a business request into a tested report.",part:"dl",tags:"requirement breakdown expectations select report build test debug new consultant step by step",
nodes:[["r","1 Requirement","what the business asked","teal",15,16,150,50],["q","2 Ask questions","who, what, when, where, how","teal",195,16,150,50],["x","3 Expectations table","fields, rules, examples","amber",15,96,150,50],["s","4 SELECT in English","columns, source, filters","amber",195,96,150,50],["b","5 Build the report","one step at a time","indigo",15,176,150,50],["t","6 Test one employee","does the row match?","indigo",195,176,150,50],["d","7 Debug","find the first wrong step","coral",15,256,150,50],["e","8 Evidence and sign-off","keep proof","gray",195,256,150,50]],
edges:[["e1","r","q"],["e2","q","x",{from:"b",to:"t"}],["e3","x","s"],["e4","s","b",{from:"b",to:"t"}],["e5","b","t"],["e6","t","d",{from:"b",to:"t"}],["e7","d","e"]],
steps:[
{t:"Read the requirement slowly",p:"Write the request in one sentence. Do not build anything yet.",k:"Requirement.",d:"\"Send payroll the active employees in Singapore with their jobs.\"",on:["r"]},
{t:"Ask the six questions",p:"Who gets it? What data? When does it run? Where does the file go? How big? What does 'done' look like?",k:"Who, what, when, where, how many, done.",d:"Who: payroll team\nWhat: employee ID, name, job, org\nWhen: daily 02:10 SGT\nWhere: SFTP /outbound/\nHow many: about 5,000\nDone: counts match",on:["q"],ed:["e1"]},
{t:"Write the expectations table",p:"One row per field: the name the receiver wants, where it comes from in Workday, the rule, and one example.",k:"Mapping sheet.",d:"Field | From Workday | Rule | Example\nEMP_ID | Employee ID | as is | E9001\nHIRE_DT | Hire Date | YYYY-MM-DD | 2024-01-15",on:["x"],ed:["e2"]},
{t:"Say it as a SELECT in English",p:"Write what you want in the order: pick columns, from which data, only these rows, in this order.",k:"Report = select statement in words.",d:"SELECT employee ID, name, job, org\nFROM all active workers\nWHERE country is Singapore\nORDER BY employee ID",on:["s"],ed:["e3"]},
{t:"Build the report",p:"Create the custom report. Add the data source, then columns, then filters, then sort, then prompts.",k:"Create Custom Report > Advanced > Data Source > Columns > Filter > Sort > Prompts.",on:["b"],ed:["e4"]},
{t:"Test with one employee first",p:"Pick one dummy employee you know well. Does the row match what you see on the worker's screen?",k:"Unit test, one record.",d:"E9001: row matches the screen",on:["t"],ed:["e5"]},
{t:"Debug in order",p:"If a row is wrong, check in order: is the person in the data, does a filter remove them, is the field empty, is the value wrong.",k:"First wrong step wins.",on:["d"],ed:["e6"]},
{t:"Keep the evidence",p:"Save the table, the screenshots (masked), the counts and the sign-off.",k:"Test evidence.",on:["e"],ed:["e7"]}
]});

A({id:"a-select-english",title:"A report is a SELECT written in clicks",sum:"Each part of a SQL SELECT has a matching part in a Workday custom report.",part:"rp",tags:"select sql from where order by report translate english columns filter data source prompts join calculated field",
nodes:[["s1","SELECT","which columns","gray",15,16,120,46],["w1","Columns tab","Field, heading","teal",225,16,120,46],["s2","FROM","which data","gray",15,78,120,46],["w2","Data source","e.g. All Workers","teal",225,78,120,46],["s3","WHERE","which rows","gray",15,140,120,46],["w3","Filter tab","Filter on Instances","teal",225,140,120,46],["s4","ORDER BY","the order","gray",15,202,120,46],["w4","Sort tab","sort fields","teal",225,202,120,46],["s5","Parameters","asked at run time","gray",15,264,120,46],["w5","Prompts tab","as-of date, org","teal",225,264,120,46],["s6","JOIN","use another table","gray",15,326,120,46],["w6","Related fields","other object","teal",225,326,120,46],["s7","Computed column","made from others","gray",15,388,120,46],["w7","Calculated field","made by function","amber",225,388,120,46]],
edges:[["e1","s1","w1"],["e2","s2","w2"],["e3","s3","w3"],["e4","s4","w4"],["e5","s5","w5"],["e6","s6","w6"],["e7","s7","w7"]],
steps:[
{t:"Same idea, different words",p:"Workday has no place for you to type SQL. A report does the same job with clicks. This is a way to think, not a Workday feature.",k:"Author's analogy for learning.",on:["s1","s2","s3","s4","s5","s6","s7"]},
{t:"SELECT = columns",p:"The columns you want to see. In the report, these are the Columns tab.",k:"Field and Column Heading Override.",d:"SELECT employee ID, name, hire date",on:["s1","w1"],ed:["e1"]},
{t:"FROM = data source",p:"Where the rows come from. A data source holds the pool of records, like all workers.",k:"Report data source.",d:"FROM all workers",on:["s2","w2"],ed:["e2"]},
{t:"WHERE = filter",p:"Which rows to keep. A filter removes the others.",k:"Filter on Instances: field, operator, value.",d:"WHERE worker status = active\nAND country = Singapore",on:["s3","w3"],ed:["e3"]},
{t:"ORDER BY = sort",p:"The order of the rows in the file.",k:"Sort tab.",d:"ORDER BY employee ID",on:["s4","w4"],ed:["e4"]},
{t:"Parameters = prompts",p:"Questions the report asks when it runs, like 'as of which date?'. Integrations pass the answers.",k:"Prompts tab; can be passed in the URL.",d:"AS OF date = today",on:["s5","w5"],ed:["e5"]},
{t:"JOIN = related object",p:"A worker has a position, an org and a company. You reach them through related fields.",k:"Related business object.",d:"position ID from the worker's position",on:["s6","w6"],ed:["e6"]},
{t:"Computed column = calculated field",p:"A new column made from other fields, like full name or a date in text.",k:"Create Calculated Field.",d:"Full name = last name, first name",on:["s7","w7"],ed:["e7"]},
{t:"Put it all in one sentence",p:"Say it in order. If you can write the sentence, you can build the report.",k:"SELECT, FROM, WHERE, ORDER BY, prompts.",d:"SELECT employee ID, name, position ID, job profile, org, cost center\nFROM all workers\nWHERE active AND country = Singapore\nAS OF today\nORDER BY employee ID\nONE ROW PER POSITION",on:["s1","s2","s3","s4","s5"]}
]});

A({id:"a-debug-report",title:"Debug a report: find the first wrong step",sum:"Check the report in order, from the data in to the value out.",part:"dl",tags:"debug report wrong row missing employee blank value filter field check",
nodes:[["a","1 Run for one employee","one known worker","teal",70,16,220,44],["b","2 Is the person in the data?","data source","teal",70,74,220,44],["c","3 Does a filter remove them?","Filter tab, prompts","amber",70,132,220,44],["d","4 Is the field empty?","or no access","amber",70,190,220,44],["e","5 Is the value wrong?","calculated field, as-of date","amber",70,248,220,44],["f","6 Compare with the screen","Workday worker page","indigo",70,306,220,44],["g","7 Fix, retest, note","evidence","gray",70,364,220,44]],
edges:[["e1","a","b"],["e2","b","c"],["e3","c","d"],["e4","d","e"],["e5","e","f"],["e6","f","g"]],
steps:[
{t:"Start small",p:"Run the report for one employee whose data you know. Do not debug 5,000 rows.",k:"One record.",d:"Prompt: worker = E9001",on:["a"]},
{t:"Is the person in the data?",p:"Run with no filters. If the person is not there, the data source does not hold them.",k:"Wrong data source, or worker type excluded.",on:["b"],ed:["e1"]},
{t:"Does a filter remove them?",p:"Add filters back one by one. When the person disappears, that filter is the cause.",k:"Check each filter and each prompt value.",d:"Add filter 1: still there\nAdd filter 2: gone",on:["c"],ed:["e2"]},
{t:"Is the field empty?",p:"A blank can mean the data is empty or you lack access. Run the report as a user who has access.",k:"Blank calculated fields can mean no access.",on:["d"],ed:["e3"]},
{t:"Is the value wrong?",p:"Check the calculated field and the as-of dates. Wrong dates give old values.",k:"Effective date and entry moment.",on:["e"],ed:["e4"]},
{t:"Compare with the screen",p:"Open the worker in Workday and compare each wrong value with the screen.",k:"Source of truth.",on:["f"],ed:["e5"]},
{t:"Fix and prove it",p:"Fix one thing, re-run, and write down what you changed and why.",k:"Change log and evidence.",on:["g"],ed:["e6"]}
]});

A({id:"a-unit-test",title:"Unit test a worker report",sum:"A short ladder of dummy employees that finds most defects.",part:"dl",tags:"unit test employee two jobs back-dated terminated special characters empty test cases",
nodes:[["t1","1 Normal worker","one job, active","teal",15,16,150,48],["t2","2 Two jobs","primary and additional","teal",195,16,150,48],["t3","3 Back-dated change","effective date in the past","amber",15,92,150,48],["t4","4 Terminated worker","last day passed","amber",195,92,150,48],["t5","5 Odd text","apostrophe, accents, long name","amber",15,168,150,48],["t6","6 Empty fields","no middle name","amber",195,168,150,48],["t7","7 Big volume","time and size","indigo",15,244,150,48],["t8","8 Evidence","table, screens, counts","gray",195,244,150,48]],
edges:[["e1","t1","t2"],["e2","t2","t3",{from:"b",to:"t"}],["e3","t3","t4"],["e4","t4","t5",{from:"b",to:"t"}],["e5","t5","t6"],["e6","t6","t7",{from:"b",to:"t"}],["e7","t7","t8"]],
steps:[
{t:"Normal worker",p:"One active worker, one job. Every field must match the Workday screen.",k:"Happy path.",d:"E9001 Priya Test\nExpected: all fields match",on:["t1"]},
{t:"Two jobs",p:"A worker with two jobs must give two rows if that is what was agreed.",k:"Rows = jobs.",d:"E9002: 2 jobs\nExpected: 2 rows",on:["t2"],ed:["e1"]},
{t:"Back-dated change",p:"A change entered today with an old effective date. Does the report show it when asked as of today? Does a delta catch it?",k:"Effective date vs entry moment.",d:"Entered 5 Nov\nEffective 1 Oct",on:["t3"],ed:["e2"]},
{t:"Terminated worker",p:"A worker whose last day has passed. Is the worker in or out as the requirement says?",k:"Termination is effective at the end of the last day.",on:["t4"],ed:["e3"]},
{t:"Odd text",p:"Apostrophes, accents and long names often break files.",k:"Encoding, quoting, length.",d:"O'Neil, Zoë, a 60-character name",on:["t5"],ed:["e4"]},
{t:"Empty fields",p:"Empty values should follow the agreed rule: blank or a default.",k:"Null vs empty.",on:["t6"],ed:["e5"]},
{t:"Big volume",p:"Run for everyone. Check time, size and row count.",k:"Limits, timeouts.",d:"Expected rows = number of positions",on:["t7"],ed:["e6"]},
{t:"Keep the evidence",p:"Table of tests: case, data, expected, actual, pass or fail, date, who. Screens with names masked.",k:"Test evidence for sign-off.",on:["t8"],ed:["e7"]}
]});
})();
