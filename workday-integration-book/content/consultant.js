(function(){
var E=BOOK.E,P=BOOK.PB,T=BOOK.TP,C=BOOK.CK;
var Z="New consultant: step by step";

/* ---------- playbooks (steps are in order) ---------- */
P({area:Z,title:"Step 1. Break down a requirement",sym:"You were given a request like 'send payroll the employee positions'. You do not know where to start.",
may:["The request is short but has hidden details","Words like 'all' or 'active' mean different things to different people","The receiver's format is not known yet"],
check:["Write the request in one sentence in your own words and send it back to confirm.","Ask the six questions: who gets it, what data, when it runs, where the file goes, how many records, what 'done' looks like.","Ask the meaning of each word: 'employee' (also contractors?), 'active' (on leave? future-dated hires?), 'all' (which companies and countries?).","Ask for the receiver's file spec and one sample file.","Ask for the as-of rule: today, or a date the user picks?","Write down what is out of scope.","Ask who will sign off."],
evid:["The one-sentence requirement","Answers to the six questions","Sample file from the receiver"],who:"The person who raised the request, and the receiver.",dont:"Do not start building until the receiver's format and the meaning of 'active' are written down.",tags:"requirement breakdown questions start"});

P({area:Z,title:"Step 2. Write the expectations table",sym:"You know what the business wants. You need a clear list of fields.",
may:["Fields have different names in Workday and in the file","Some fields need rules (date format, codes, defaults)","Some fields come from related objects"],
check:["Make a table with these columns: file field name, meaning, where it comes from in Workday, rule, example, can it be empty.","Fill one row per field from the receiver's spec.","For each row, find the Workday field. Use the Business Object Details report on the Worker object to list fields.","Write the rule: copy as is, format a date, translate a code, join text, default when empty.","Add one real example value (dummy) for each row.","Mark rows you are not sure about and ask.","Send the table back for sign-off before you build."],
evid:["The expectations table","Sign-off message"],who:"Receiver for the file field list; HR or payroll for the meaning.",dont:"Do not guess a Workday field name. Check it in your tenant.",tags:"expectations mapping table fields rules"});

P({area:Z,title:"Step 3. Write the SELECT in English",sym:"You have the table. You need to know how to say it as a report.",
may:["You are not sure which data source to use","You are not sure what counts as one row"],
check:["Write: SELECT (the columns), FROM (the data source), WHERE (the rules for which rows), ORDER BY (the order).","Write what one row means, for example 'one row per position'.","Write the prompts, for example 'as of date' and 'organization'.","Write the calculated fields you need and the rule for each.","Read the sentence to a teammate. Does it match the requirement?","Example: SELECT employee ID, name, position ID, job profile, org, cost center FROM all workers WHERE active AND country is Singapore AS OF today ORDER BY employee ID. ONE ROW PER POSITION."],
evid:["The SELECT sentence"],who:"Your lead for review.",dont:"Do not say 'I will just build it and see'. A written sentence saves hours.",tags:"select sql english translate"});

P({area:Z,title:"Step 4. Build the report",sym:"You have the SELECT sentence. You need to make the report in Workday.",
may:["The data source does not have the field","A field is on a related object","You are not allowed to create reports"],
check:["Check you have access to create custom reports (ask if the task is missing).","Run the Create Custom Report task. Give it a clear name. Choose Report Type Advanced and your Data Source.","If you can, copy a close standard report to a custom report first (Copy Standard Report to Custom Report).","Columns tab: add each field. Use Column Heading Override for the name the receiver wants.","Filter tab: add one filter at a time. Use 'Prompt the user for the value' when the value changes.","Sort tab: add the sort.","Prompts tab: set the labels and defaults.","Advanced tab: tick Enable As Web Service if an integration will read it, and choose the current Web Service API Version.","Share tab: share it with the right group.","Run it for one dummy employee."],
evid:["Report name","Screenshots of each tab (mask data)","One sample output"],who:"Your lead; the report owner for existing reports.",dont:"Never use a standard report directly in an integration. Copy it first.",tags:"build report custom report steps"});

P({area:Z,title:"Step 5. Check one employee has all the details",sym:"The report runs. You need to prove it is right for a real-looking employee.",
may:["A field is empty because of access","A field is wrong because of the as-of date","Only the primary job appears"],
check:["Pick a dummy employee with known data. Open the worker's pages in Workday.","Make a two-column list: 'On the Workday screen' and 'In the report'.","Run the report with the prompt set to that employee.","Compare each field. Mark match or not.","Check the job: does the report show every job or only the primary job?","Check dates: hire date, effective date, as-of date.","Check codes: are they the receiver's codes after translation?","Check empty fields: is it blank in Workday too?","Save the comparison."],
evid:["Comparison table (masked)","Screenshots of both sides"],who:"HR operations for the real record if needed.",dont:"Do not use a real employee's data in tickets or chat.",tags:"check employee details compare one worker"});

P({area:Z,title:"Step 6. Debug a report that is wrong",sym:"A row is missing, a value is wrong, or a column is blank.",
may:["The person is not in the data source","A filter removes them","The field is empty or you lack access","The value is wrong from a calculated field or as-of date"],
check:["Run for one employee only.","Remove all filters. Is the person there? If not, the data source is wrong.","Add filters back one at a time. The filter that removes the person is the cause.","Check access: run as a user with access, or ask the security administrator.","Check the calculated field inputs one by one.","Check the as-of effective date and entry moment.","Compare with the Workday screen.","Change one thing at a time and re-run.","Write what you changed."],
evid:["Before and after output","The change you made"],who:"Your lead; security administrator for access.",dont:"Do not change many things at once. You will not know what fixed it.",tags:"debug report wrong blank missing"});

P({area:Z,title:"Step 7. Unit test the report",sym:"You need to prove the report is ready for the next test.",
may:["Happy path passes but edge cases fail"],
check:["Make a test table: case, data, expected, actual, pass or fail, date, who.","Test 1: normal worker, one job.","Test 2: worker with two jobs.","Test 3: back-dated change.","Test 4: terminated worker.","Test 5: name with apostrophe, accent or long text.","Test 6: empty fields.","Test 7: full volume: row count equals the expected number, check run time.","Fix failures, re-run the failed tests and the neighbours.","Save the table and screenshots for sign-off."],
evid:["Test table","Screenshots","Row counts"],who:"Your lead; the tester for SIT.",dont:"Do not skip the two-jobs and back-dated tests.",tags:"unit test cases edge evidence"});

P({area:Z,title:"Worked example: 'positions of all active employees'",sym:"Requirement: 'Give payroll all positions for active employees in Singapore, daily.' All data here is dummy.",
may:["'Active' might include people on leave","'Positions' might mean additional jobs too","'Daily' needs a time and time zone"],
check:["Questions asked: is leave included? additional jobs included? time? file format? receiver?","Answers: leave included; all jobs; 02:10 SGT; CSV pipe-delimited; payroll vendor via SFTP.","Expectations table: EMP_ID, NAME, POSITION_ID, JOB_PROFILE, ORG, COST_CENTER, START_DT, PRIMARY_FLAG.","SELECT in English: employee ID, name, position ID, job profile, org, cost center, start date, primary flag FROM all workers WHERE active (including leave) AND country is Singapore AS OF today ORDER BY employee ID, one row per position.","Build the report. Check the fields that return all positions in Business Object Details.","Unit test: E9001 one job (1 row), E9002 two jobs (2 rows), E9003 back-dated, E9004 terminated yesterday, E9005 name O'Neil.","Count: expected rows = number of positions.","Wrap with an EIB or Core Connector, then schedule with an odd minute and the right time zone.","Reconcile with the receiver after the first run."],
evid:["All the above"],who:"Your lead and the payroll contact.",dont:"Do not skip the questions. Most defects start with a wrong meaning of 'active'.",tags:"worked example positions active employees"});

/* ---------- terms ---------- */
function X(t,m,x,f,lv,k,tags,aka){return E("rp",t,m,x,f,lv||1,k||"g",tags,aka)}
X("SELECT (in English)","Say which columns you want, written as a list.","SELECT employee ID, name, hire date.","In Workday you do this on the Columns tab of a report.",1,"g","select sql report");
X("FROM (data source)","Say where the rows come from.","FROM all workers.","In a report this is the data source.",1,"g","select sql report");
X("WHERE (filter)","Say which rows to keep.","WHERE active AND country = Singapore.","In a report this is the Filter tab.",1,"g","select sql report");
X("ORDER BY (sort)","Say the order of the rows.","ORDER BY employee ID.","In a report this is the Sort tab.",1,"g","select sql report");
X("JOIN (related fields)","Use data from another connected object.","Position ID from the worker's position.","In a report you pick fields from a related business object.",2,"g","select sql report");
X("One row per what?","Decide what one row means before you build.","One row per worker, or one row per position.","The most important question for a file. Two jobs mean two rows if it is per position.",1,"g","select report row");
X("Expectations table","A table that lists each output field, where it comes from, its rule and an example.","EMP_ID | Employee ID | as is | E9001.","Build it before the report. It is the same as a mapping sheet.",1,"g","expectations mapping requirement");
X("Requirement breakdown","Turning a short request into questions, a table and a SELECT sentence.","Who, what, when, where, how many, done.","Do it in writing and get it confirmed.",1,"g","requirement breakdown");
X("Definition of done","What must be true for the work to be accepted.","Counts match and payroll signs off.","Ask for it at the start.",1,"g","requirement");
X("Acceptance criteria","A checklist the business uses to accept the work.","All active workers present; dates in YYYY-MM-DD.","Turn each criterion into a test.",2,"g","requirement test");
X("Happy path","The normal case when everything is fine.","Active worker, one job.","Test it first, then the odd cases.",2,"g","test");
X("Test table","A table of tests with expected and actual results.","Case, data, expected, actual, pass, date, who.","Keep it as evidence.",1,"g","test evidence");

/* ---------- template and checklists ---------- */
T({title:"Requirement breakdown sheet",when:"Start of any new integration or report.",body:"Requirement in one sentence:\n\nWho gets it:\nWhat data:\nWhen it runs (time and time zone):\nWhere it goes (folder, system):\nHow many records:\nDone means:\n\nMeaning of words:\n- employee =\n- active =\n- all =\nAs-of rule:\nOne row per:\nOut of scope:\nReceiver's spec and sample file:\nSign-off by:\n\nExpectations table:\nField | Meaning | From Workday | Rule | Example | May be empty\n\nSELECT in English:\nSELECT\nFROM\nWHERE\nORDER BY\nPrompts:\nCalculated fields:"});
T({title:"Unit test table",when:"Testing a report or integration.",body:"Case | Data (dummy) | Expected | Actual | Pass or fail | Date | Who\n1 Normal worker, one job\n2 Worker with two jobs\n3 Back-dated change\n4 Terminated worker\n5 Name with apostrophe or accent\n6 Empty fields\n7 Full volume: rows = positions"});
C({title:"Check one employee",items:["Pick a dummy employee with known data","Open the worker screens in Workday","Run the report for that employee","Compare each field with the screen","Check every job is present","Check dates and as-of values","Check codes after translation","Check empty fields match Workday","Save the comparison"]});
C({title:"Report debug order",items:["Run for one employee","Remove filters: is the person there?","Add filters back one at a time","Check access to fields","Check calculated field inputs","Check as-of dates","Compare with the Workday screen","Change one thing at a time","Write down the change"]});
})();
