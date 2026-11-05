(function(){
var A=BOOK.A;

A({id:"a-flow",title:"What an integration is",sum:"Data moves from Workday through an integration into shared storage, then payroll picks it up.",part:"if",tags:"basics flow shared storage source target",
nodes:[["wd","Workday","source system","teal",15,20,140,56],["in","Integration","reads, changes, writes a file","amber",205,20,140,56],["st","Shared storage","a folder both can reach","indigo",205,120,140,56],["pay","Payroll vendor","target system","gray",15,120,140,56],["er","Problem?","you check log and counts","coral",110,220,140,56,{dash:1}]],
edges:[["e1","wd","in"],["e2","in","st"],["e3","st","pay"],["e4","st","er",{dash:1}]],
steps:[
{t:"Data starts in Workday",p:"Workday holds the worker data. It is the source system.",k:"Source system = where data starts.",d:"Worker E1001, Priya Test\nOrg: Data Team",on:["wd"],chip:["wd","5,000 workers"]},
{t:"The integration reads and shapes it",p:"A job runs on a schedule. It picks the data and changes it to the shape the receiver wants.",k:"Extract, transform, load (ETL).",d:"Run 02:10 SGT\nReads report, applies mapping",on:["wd","in"],ed:["e1"],chip:["in","5,000 rows"]},
{t:"It saves a file in shared storage",p:"The integration does not talk to payroll directly. It puts a file in a shared folder.",k:"SFTP folder. File name rule must match the spec.",d:"/outbound/payroll/\nWORKERS_20261104_0210.csv",on:["in","st"],ed:["e2"],chip:["st","1 file"]},
{t:"The receiver picks it up",p:"The payroll vendor reads the file from the same folder.",k:"Pickup is the receiver's job. Permissions must allow it.",d:"Vendor reads WORKERS_20261104_0210.csv",on:["st","pay"],ed:["e3"],chip:["pay","5,000 rows"]},
{t:"Check the counts",p:"Compare the number sent with the number loaded. They must match.",k:"Reconciliation.",d:"Sent 5,000\nLoaded 4,998\nDifference 2: find them",on:["pay","st"],chip:["pay","4,998",true]},
{t:"If something fails",p:"Look at the log first. Then the file. Then the receiver. Do not guess.",k:"Log, event status, file, delivery status.",d:"Run: Completed\nDelivery: Failed",on:["st","er"],ed:["e4"],chip:["er","check log",true]}
]});

A({id:"a-sftp",title:"How a file moves by SFTP",sum:"Workday puts a file on an SFTP server. The vendor logs in and takes it.",part:"if",tags:"sftp transport shared storage delivery",
nodes:[["wd","Workday","delivery step","teal",15,20,140,56],["sv","SFTP server","folder /outbound/","indigo",205,20,140,56],["ven","Vendor","scheduled pickup","gray",205,130,140,56],["keys","Keys and login","public key on server","amber",15,130,140,56,{dash:1}],["chk","You check","file name, time, size","coral",110,230,140,50]],
edges:[["e1","wd","sv"],["e2","sv","ven"],["e3","keys","sv",{from:"t",to:"l"}],["e4","ven","chk",{dash:1}]],
steps:[
{t:"Workday connects",p:"Workday logs in to the server with a key or password and opens the folder.",k:"Host, port 22, credentials from the transport.",d:"sftp.vendor.example:22\nuser: wd_payroll",on:["wd","sv","keys"],ed:["e1","e3"]},
{t:"The file is dropped",p:"The file is written with the agreed name. A partial name until it finishes can help the vendor avoid half files.",k:"Naming convention, temp name then rename.",d:"WORKERS_20261104_0210.csv\n812 KB",on:["wd","sv"],ed:["e1"],chip:["sv","1 file"]},
{t:"The vendor collects",p:"The vendor checks the folder on its own schedule and takes the file.",k:"Pickup schedule is the vendor's.",d:"Pickup 03:00",on:["sv","ven"],ed:["e2"],chip:["ven","collected"]},
{t:"Common failures",p:"Wrong host, wrong folder, expired key, blocked port, wrong file name.",k:"Connection refused, permission denied, timeout.",d:"Permission denied\nNo such file",on:["sv","keys"],chip:["keys","key expired",true]},
{t:"What you check",p:"Event status and delivery status in Workday. Then the file in the folder. Then ask the vendor.",k:"Completed does not prove delivered.",d:"Integration event: Completed\nDeliver Document: Failed",on:["ven","chk"],ed:["e4"],chip:["chk","3 checks"]}
]});

A({id:"a-delta",title:"Full file and delta file",sum:"A full file sends everyone every time; a delta sends only what changed since the last good run.",part:"if",tags:"full delta change detection last successful run",
nodes:[["full","Full file","everyone, every run","teal",15,20,140,60],["delta","Delta file","only changes","amber",205,20,140,60],["m","Last run marker","time of last good run","indigo",110,130,140,56],["new","Changes since marker","hires, edits, leavers","gray",110,230,140,56],["bad","If marker moves on a failed run","changes lost","coral",15,320,330,50,{dash:1}]],
edges:[["e1","m","delta",{from:"t",to:"b"}],["e2","new","m",{from:"t",to:"b"}]],
steps:[
{t:"Full file",p:"Every run sends all workers. Easy and safe, but big.",k:"Good for first loads, small data, vendors that replace data.",d:"Run 1: 5,000 rows\nRun 2: 5,000 rows",on:["full"],chip:["full","5,000"]},
{t:"Delta file",p:"Each run sends only records that changed since the last good run.",k:"Needs a marker for 'last good run'.",d:"Run 1: 5,000 rows (first full)\nRun 2: 7 rows",on:["delta","m"],ed:["e1"],chip:["delta","7"]},
{t:"The marker",p:"The marker is the time of the last successful run. Next run asks: what changed after this time?",k:"Last Successful As Of Entry Moment and Effective Date.",d:"Marker: 2026-11-03 02:10\nNow: 2026-11-04 02:10",on:["m","new"],ed:["e2"]},
{t:"Two dates matter",p:"Use the entry date to catch changes typed late. A back-dated change has an old effective date but a new entry date.",k:"Effective date vs entry moment.",d:"Effective: 2026-10-01\nEntered: 2026-11-03 17:20",on:["new"],chip:["new","back-dated",true]},
{t:"Danger: marker moves too soon",p:"If the marker moves forward when the run failed, changes are lost. Always check the run status before trusting the next delta.",k:"Only a primary, successful run should advance the marker.",d:"Run failed\nMarker moved\nChanges lost",on:["bad"],chip:["bad","lost",true]},
{t:"Safety net",p:"Do a regular full reconciliation. For example, once a week compare a full list with the vendor's list.",k:"Weekly full recon.",d:"Mon: full compare\nTue-Sun: deltas",on:["full","delta"]}
]});

A({id:"a-reconcile",title:"Reconcile: do the two sides match?",sum:"Compare counts and IDs between Workday and the target to find what is missing or extra.",part:"if",tags:"reconciliation count missing duplicate",
nodes:[["a","Workday list","5,000 IDs","teal",15,20,140,56],["b","Vendor list","4,998 IDs","gray",205,20,140,56],["c","Compare","by Employee ID","amber",110,130,140,56],["miss","Missing at vendor","2 IDs","coral",15,240,140,56],["extra","Extra at vendor","0 IDs","coral",205,240,140,56,{dash:1}]],
edges:[["e1","a","c",{from:"b",to:"t"}],["e2","b","c",{from:"b",to:"t"}],["e3","c","miss",{from:"b",to:"t"}],["e4","c","extra",{from:"b",to:"t"}]],
steps:[
{t:"Get two lists",p:"Take the list of IDs from Workday and the list from the target.",k:"Use the same cut-off time and filters.",d:"Workday: 5,000\nVendor: 4,998",on:["a","b"],chip:["a","5,000"]},
{t:"Compare by a key",p:"Compare using the ID, not the name. Names repeat; IDs do not.",k:"Join on Employee ID.",d:"E1001 in both\nE1002 in both\nE1003 only Workday",on:["a","b","c"],ed:["e1","e2"]},
{t:"Missing ones",p:"IDs in Workday but not in the target are missing.",k:"Left minus right.",d:"E1003\nE1990",on:["c","miss"],ed:["e3"],chip:["miss","2",true]},
{t:"Extra ones",p:"IDs in the target but not in Workday are extra. Could be old leavers.",k:"Right minus left.",d:"None",on:["c","extra"],ed:["e4"]},
{t:"Find the reason",p:"For each missing ID ask: was the filter wrong, was the worker new, did the row fail validation, was it a late change?",k:"Check eligibility, dates, errors.",d:"E1003: no pay group\nE1990: hire date in future",on:["miss"]},
{t:"Record the result",p:"Write counts, differences and reasons in the daily log. Try the Lab in this book.",k:"Evidence.",d:"Diff 2, explained.",on:["a","b","c"]}
]});

A({id:"a-xslt",title:"XSLT: XML in, new file out",sum:"A stylesheet reads XML with XPath and writes a different shape.",part:"fm",tags:"xslt xpath xml transform",
nodes:[["in","Input XML","from Workday","teal",15,20,140,56],["x","XSLT stylesheet","rules","amber",205,20,140,56],["eng","Transform","match, select, write","indigo",110,130,140,56],["out","Output","CSV or new XML","gray",110,230,140,56]],
edges:[["e1","in","eng",{from:"b",to:"t"}],["e2","x","eng",{from:"b",to:"t"}],["e3","eng","out"]],
steps:[
{t:"Start with XML",p:"The input is a tree of tags.",k:"Elements, attributes, namespaces.",d:"<Workers>\n <Worker id=\"E1001\">\n  <Name>Priya</Name>\n </Worker>\n</Workers>",on:["in"]},
{t:"Rules in the stylesheet",p:"Each template says: when you see this part, write that.",k:"xsl:template match=\"Worker\"",d:"<xsl:template match=\"Worker\">\n <xsl:value-of select=\"@id\"/>|\n <xsl:value-of select=\"Name\"/>\n</xsl:template>",on:["x"]},
{t:"XPath points to the data",p:"select=\"Name\" is an XPath. It tells the stylesheet where to read.",k:"Namespaces need a prefix.",d:"@id  = attribute\nName = child element\n//Name = anywhere",on:["x","eng"],ed:["e2"]},
{t:"The engine runs",p:"The engine walks the input and applies the rules.",k:"Transformer: Saxon, Xalan, or Workday's own.",d:"Match Worker\nWrite E1001|Priya",on:["in","x","eng"],ed:["e1","e2"]},
{t:"Output",p:"The result is the file the vendor wants.",k:"xsl:output method=\"text\".",d:"E1001|Priya\nE1002|Sam",on:["eng","out"],ed:["e3"],chip:["out","2 rows"]},
{t:"Typical mistakes",p:"Missing namespace, wrong path, extra spaces, wrong line ending.",k:"Test in the XPath lab with dummy XML.",d:"Empty output = wrong path or namespace",on:["x"],chip:["x","empty?",true]}
]});

A({id:"a-api-types",title:"SOAP and REST",sum:"Two ways programs call Workday over the web.",part:"fm",tags:"soap rest api wsdl json xml",
nodes:[["c","Your program","calls Workday","teal",110,20,140,56],["soap","SOAP","XML envelope, WSDL, Get_Workers","amber",15,140,150,76],["rest","REST","URL + JSON, OAuth","indigo",195,140,150,76],["wd","Workday","responds","gray",110,260,140,56]],
edges:[["e1","c","soap",{from:"b",to:"t"}],["e2","c","rest",{from:"b",to:"t"}],["e3","soap","wd",{from:"b",to:"t"}],["e4","rest","wd",{from:"b",to:"t"}]],
steps:[
{t:"Same goal, two styles",p:"Both let a program read or write Workday data.",k:"Web services.",on:["c","wd"]},
{t:"SOAP",p:"Sends an XML envelope to one address. The WSDL lists the operations. Workday SOAP has thousands of operations.",k:"Get_Workers with Response_Filter, version in the request.",d:"<bsvc:Get_Workers_Request\n  bsvc:version=\"v43.0\">",on:["soap"],ed:["e1","e3"]},
{t:"REST",p:"Uses URLs and HTTP verbs. Usually JSON. Fewer operations; good for smaller calls.",k:"OAuth 2.0 token; GET needs View, others Modify.",d:"GET /workers/12\nAuthorization: Bearer ...",on:["rest"],ed:["e2","e4"]},
{t:"Permissions differ",p:"SOAP uses Get/Put on domains. REST uses View/Modify. Mixing them up gives 403.",k:"Integration Permissions apply to SOAP only.",on:["soap","rest"]},
{t:"Which to use",p:"Big transfers: SOAP or files. Small, modern calls: REST. Reports: RaaS.",k:"Check what the vendor supports.",on:["c"]}
]});

A({id:"a-http",title:"HTTP request and status codes",sum:"A request goes out; a numbered reply comes back. The number tells you who to chase.",part:"fm",tags:"http status 401 403 404 500 503",
nodes:[["c","Client","you or a program","teal",15,20,140,56],["s","Server","Workday or vendor","gray",205,20,140,56],["ok","2xx worked","200 OK","teal",15,150,140,50],["ce","4xx your side","400 401 403 404 429","amber",205,150,140,50],["se","5xx their side","500 503","coral",110,230,140,50]],
edges:[["e1","c","s"],["e2","s","ok",{from:"b",to:"t"}],["e3","s","ce",{from:"b",to:"t"}],["e4","s","se",{from:"b",to:"t"}]],
steps:[
{t:"Request",p:"The client asks for something with a verb, an address and headers.",k:"GET /workers?page=1",d:"GET /workers?page=1\nAuthorization: Bearer ...",on:["c","s"],ed:["e1"]},
{t:"200 range: worked",p:"200 OK. 201 Created. 204 No content.",k:"Success.",d:"200 OK",on:["s","ok"],ed:["e2"]},
{t:"401: who are you?",p:"Login or token is wrong or expired.",k:"Authentication failed.",d:"401 Unauthorized",on:["s","ce"],ed:["e3"],chip:["ce","401",true]},
{t:"403: not allowed",p:"You are known, but you have no permission. Check security group, domain and activation.",k:"Authorization failed.",d:"403 Forbidden",on:["s","ce"],ed:["e3"],chip:["ce","403",true]},
{t:"404 and 400",p:"404: wrong address or ID. 400: your request is badly formed.",k:"Check URL, version, payload.",d:"404 Not Found\n400 Bad Request",on:["ce"],chip:["ce","404",true]},
{t:"429 and 503: slow down",p:"Too many calls or system busy. Wait and retry with back-off.",k:"Throttling.",d:"429 Too Many Requests\n503 Service Unavailable",on:["se"],ed:["e4"],chip:["se","503",true]}
]});

A({id:"a-org-tree",title:"Organization tree and 'send the hierarchy'",sum:"How supervisory organizations nest, and what 'all levels' means for a file.",part:"hr",tags:"org hierarchy supervisory",
nodes:[["co","Acme Group","level 1","teal",110,20,140,48],["tech","Technology","level 2","teal",15,110,140,48],["fin","Finance","level 2","teal",205,110,140,48],["data","Data Team","level 3","teal",15,200,140,48],["acc","Accounts","level 3","teal",205,200,140,48],["flat","Flat file rows","org, parent, level","amber",110,290,140,56,{dash:1}]],
edges:[["e1","co","tech",{from:"b",to:"t"}],["e2","co","fin",{from:"b",to:"t"}],["e3","tech","data"],["e4","fin","acc"],["e5","data","flat",{from:"b",to:"t"}]],
steps:[
{t:"The top",p:"Every tree has one top organization. Everything else sits below it.",k:"Top node.",on:["co"],vis:["co"]},
{t:"Level 2",p:"The top has child organizations.",k:"Each child has exactly one parent.",on:["tech","fin"],vis:["co","tech","fin"],ed:["e1","e2"]},
{t:"Level 3",p:"Each child can have its own children. The tree can go many levels deep.",k:"Depth is not fixed.",on:["data","acc"],vis:["co","tech","fin","data","acc"],ed:["e3","e4"]},
{t:"Who manages whom",p:"The manager of Data Team is part of Technology, the organization above. A manager is not a member of the team they manage.",k:"Manager is a role assignment.",d:"Ravi: manager of Data Team\nRavi sits in Technology",on:["tech","data"]},
{t:"A tree in a flat file",p:"A file has rows, so each row says who the parent is. A receiver can rebuild the tree from that.",k:"Adjacency list: org, parent, level, path.",d:"Org,Parent,Level\nAcme Group,,1\nTechnology,Acme Group,2\nData Team,Technology,3",on:["flat","data"],ed:["e5"],vis:["co","tech","fin","data","acc","flat"]},
{t:"Questions to ask",p:"Which org type? Which top node? How many levels? Include inactive orgs? As of which date?",k:"Supervisory vs cost center vs company hierarchy.",on:["co","tech","fin","data","acc"],vis:["co","tech","fin","data","acc"]}
]});
})();
