(function(){
var P=BOOK.PB;
var DONT_RERUN="Do not re-run a primary run or edit Production settings before you know why it failed.";

P({area:"File problems",title:"The file did not arrive",sym:"The vendor says no file came. Workday shows the integration ran.",
may:["The run failed or never started","Delivery failed even though the run says Completed","Wrong folder, host or file name","Expired key or blocked port","The vendor picked up too early or too late"],
check:["Open the integration event. Note the time, status and messages.","Check the delivery step status.","Look in the SFTP folder, if you may, for the file name and time.","Compare the file name with the spec.","Ask the vendor for their pickup time and their log."],
evid:["Event ID and status","Delivery status","File name, size, time (time zone!)","Vendor's message"],who:"Vendor contact for their log; your lead if keys or access are involved.",dont:DONT_RERUN,tags:"sftp delivery missing file"});

P({area:"File problems",title:"The file is empty",sym:"The file exists but has no rows, or only a header.",
may:["Filter or prompt value wrong","Delta found no changes","Delta marker moved after a failed run","The running account lacks access to fields or data","Eligibility or pay group condition excludes all"],
check:["Run the source report as the same account, with the same prompts.","Check the launch parameters (dates, Full File).","Check the last successful run values.","Check security group permissions for the data.","Try a full file in a test tenant."],
evid:["Report row count","Launch parameters used","Marker values before and after"],who:"Your lead; security admin if access is the cause.",dont:DONT_RERUN,tags:"empty delta marker security"});

P({area:"File problems",title:"The counts do not match",sym:"Workday sent 5,000. The vendor loaded 4,998.",
may:["Rows rejected by the vendor","Duplicate IDs collapsed","Late changes not in the file","Different filters or cut-off times","Multiple jobs counted differently"],
check:["Get both ID lists.","Compare by ID (use the Reconcile lab).","For each difference, check status, dates and pay group.","Ask the vendor which rows failed and why."],
evid:["Both lists","The difference list with reasons"],who:"Vendor and payroll contact.",dont:"Do not 'fix' by sending a duplicate file.",tags:"reconcile count mismatch"});

P({area:"Data problems",title:"A worker is missing",sym:"A person is in Workday but not in the file.",
may:["Worker not eligible","Hire is not complete or the effective date is in the future","No pay group or wrong pay group","Report filter excludes them","Delta missed the change"],
check:["Open the worker. Check status and effective dates.","Check the business process is complete.","Check pay group and company.","Run the report for that single worker.","Check the file for the ID in other columns."],
evid:["Worker ID (mask in chat)","Dates and status","Report result"],who:"HR operations for the record; your lead for the logic.",dont:"Do not paste a real worker's details in public chat.",tags:"missing worker eligibility"});

P({area:"Data problems",title:"A worker appears twice",sym:"Same person, two rows in the file or in the vendor system.",
may:["Worker has two jobs and the file is one row per job","Rehire created a new record","The file was loaded twice","Duplicate in vendor"],
check:["Check whether the worker has additional jobs.","Check rehire history and IDs.","Check if the file name or run repeated.","Compare IDs, not names."],
evid:["Row numbers","Job list","Run history"],who:"Payroll or vendor.",dont:"Do not delete in Production before agreeing with the business.",tags:"duplicate multiple jobs rehire"});

P({area:"Data problems",title:"A value is wrong",sym:"A field shows an unexpected value in the file or at the vendor.",
may:["Value mapping missing or wrong","Wrong source field","Calculated field logic","Date or time zone difference","Old data (as-of date)"],
check:["Find the field in the mapping sheet.","Check the source value in Workday as of the right date.","Check the map table.","Check the calculated field and its inputs.","Compare with a known good record."],
evid:["Field name","Source value","Output value","Mapping rule"],who:"Your lead; owner of the mapping.",dont:"Do not change the map in Production without a change record.",tags:"wrong value mapping calculated"});

P({area:"Data problems",title:"Dates are off by one day",sym:"A hire date shows one day earlier or later at the vendor.",
may:["Time zone conversion (UTC vs local)","Date with time sent where only date was agreed","Different date formats (day/month)","Termination counted at end of day"],
check:["Look at the raw value in the file.","Check whether a time and offset were included.","Compare with the spec's format.","Test with a date at midnight."],
evid:["Raw value","Spec format","Examples"],who:"Vendor for their parsing; your lead.",dont:"Do not add a day to 'fix' it without finding the cause.",tags:"date time zone"});

P({area:"Data problems",title:"Strange characters in names",sym:"Names show symbols or question marks.",
may:["Encoding mismatch (UTF-8 vs other)","BOM present or missing","Excel changed the file","Vendor system not UTF-8"],
check:["Open the file in a text editor with an encoding display.","Check what the spec says.","Check whether the file was opened and saved in Excel.","Test one accented name."],
evid:["Before and after examples (dummy)"],who:"Vendor.",dont:"Do not save the file from Excel before sending.",tags:"encoding bom utf-8"});

P({area:"Run problems",title:"It did not run on schedule",sym:"No integration event at the expected time.",
may:["Schedule disabled or wrong time zone","Previous run still running","Tenant maintenance window","Integration subscriptions disabled in a refreshed tenant","Business process failed before the step"],
check:["Check the schedule and its time zone.","Check Process Monitor for running processes.","Check release or maintenance calendar.","Check if the tenant was recently refreshed."],
evid:["Schedule screenshot","Calendar entry"],who:"Your lead; Workday admin.",dont:DONT_RERUN,tags:"schedule not run"});

P({area:"Run problems",title:"401 Unauthorized",sym:"Authentication failed when calling an API or report.",
may:["Wrong user or password","Expired password or token","Wrong tenant or URL","Token not sent correctly"],
check:["Check the URL's tenant and environment.","Check the credentials with the owner.","Check password expiry and exemption for the ISU.","Check that the token was not expired (REST tokens expire).","Re-request a token."],
evid:["Time of call","URL (no secrets)","Response code"],who:"Security admin or account owner.",dont:"Do not share passwords or tokens in chat or email.",tags:"401 authentication token"});

P({area:"Run problems",title:"403 or blank fields",sym:"Access denied, or a report column is empty.",
may:["Security group lacks domain permission","Changes not activated","Wrong permission type (Get/Put vs View/Modify)","Calculated field returns blank when access is missing","Constrained group sees too little"],
check:["Check the ISU's group and its domain permissions.","Check that pending security changes were activated.","Check SOAP vs REST permission type.","Run the report as another allowed user to compare."],
evid:["Domain names","Permission screenshot","Call and response code"],who:"Security administrator.",dont:"Do not ask for broad access. Ask for the specific domain.",tags:"403 security blank domain"});

P({area:"Run problems",title:"Report-as-a-Service is empty or times out",sym:"A report URL returns nothing or takes too long.",
may:["Prompt values wrong","Filter too strict","Report too heavy for web service","Not enabled as web service","Old Web Service API Version","Throttling (503)"],
check:["Run the report in the UI with the same prompts.","Check Enable as Web Service.","Narrow the date range.","Check the API version.","Retry later with back-off."],
evid:["Prompt values","Row count in the UI","Response code"],who:"Report owner; your lead.",dont:"Do not call it in a tight loop.",tags:"raas timeout report"});

P({area:"Run problems",title:"XSLT or schema error",sym:"A transformation fails or output is rejected.",
may:["Wrong XPath or missing namespace","Input XML shape changed","Output does not match the schema","Large input memory limits"],
check:["Open the error message.","Test the XSLT with a small dummy XML in the XPath lab.","Compare the input shape with the last good one.","Validate output against the schema."],
evid:["Error text","Sample input (dummy)","Stylesheet version"],who:"Your lead; vendor for schema.",dont:"Do not edit Production attachments without a copy of the old one.",tags:"xslt schema xpath"});

P({area:"Run problems",title:"SFTP connection error",sym:"Connection refused, timed out, or permission denied.",
may:["Wrong host or port","Firewall or allow-list","Expired or wrong key","Folder permission","Server down"],
check:["Check the transport settings against the spec.","Try the same login from an approved tool.","Ask the vendor if the server is up and keys are valid.","Check key expiry dates."],
evid:["Error text","Time","Transport name"],who:"Vendor; security admin for keys.",dont:"Do not switch to plain FTP.",tags:"sftp connection key"});

P({area:"Run problems",title:"Slow or very large run",sym:"The run takes much longer than usual or hits a limit.",
may:["Volume spike","Full file instead of delta","Heavy calculated fields","Many integrations at the same time","Throttling"],
check:["Compare row counts with normal.","Check launch parameters.","Check schedule overlap.","Test a smaller scope."],
evid:["Run times","Row counts"],who:"Your lead.",dont:"Do not cancel a payroll run mid-way without agreeing.",tags:"slow performance volume"});

P({area:"Payroll problems",title:"Change after the payroll cut-off",sym:"A change was entered after payroll closed.",
may:["Normal: it goes to the next period","Retro pay needed","Vendor has an off-cycle option"],
check:["Confirm the cut-off date and time with payroll.","Check effective and entry dates of the change.","Check that the next file will carry it.","Tell payroll what changed and why."],
evid:["Change details","Cut-off rule","Message to payroll"],who:"Payroll team.",dont:"Do not promise a payment date.",tags:"cut-off retro payroll"});

P({area:"Payroll problems",title:"Wrong pay for one worker",sym:"A worker's pay looks wrong.",
may:["Back-dated change not received","Mapping of earnings code","Two jobs not handled","Leave or termination date","Vendor calculation"],
check:["Check the worker's history with effective and entry dates.","Check what was sent in each file.","Check mapping for each earning.","Ask payroll which input they used."],
evid:["History timeline","File extracts (masked)"],who:"Payroll team.",dont:"Do not share pay details outside the named group.",tags:"pay wrong history retro"});

P({area:"Payroll problems",title:"A delta missed a change",sym:"A change in Workday never reached the vendor.",
may:["Back-dated change detected by effective date only","Marker moved after a failed run","Change outside the fields watched","Eligibility changed"],
check:["Find the change's effective and entry dates.","Compare with the last successful run values.","Check whether the fields are part of change detection.","Plan a corrective full compare."],
evid:["Dates","Run values"],who:"Your lead.",dont:DONT_RERUN,tags:"delta missed change marker"});

P({area:"Load problems",title:"EIB load errors",sym:"An inbound EIB loaded some rows and rejected others.",
may:["Wrong ID type or value","Wrong date format","Required field blank","Security prevents update","Reference not found"],
check:["Read the error per row.","Check template version and column order.","Check dates are YYYY-MM-DD.","Fix only failed rows; do not reload good ones."],
evid:["Error list","Source rows (dummy)"],who:"Your lead; HR operations.",dont:"Do not reload the whole file.",tags:"eib load errors"});

P({area:"Judgement",title:"Should I re-run it?",sym:"Something failed and someone says 'just run it again'.",
may:["Safe if idempotent and no marker moves","Unsafe if it duplicates data or moves the delta marker"],
check:["Find out why it failed.","Check whether a re-run is a primary or ad hoc run.","Check whether the vendor will load a second file safely.","Get approval in writing."],
evid:["Reason","Approval"],who:"Your lead and the receiver.",dont:"Do not re-run just to see.",tags:"rerun safe"});

P({area:"Judgement",title:"Works in Sandbox, fails in Production",sym:"The same integration works in test but not live.",
may:["Different security setup","Different IDs (WIDs)","Different endpoint, key or folder","Different data volume or data shapes","Settings not migrated"],
check:["Compare security group and ISU.","Compare transport and attributes.","Compare data for the failing record.","Check what was migrated."],
evid:["Side-by-side settings"],who:"Your lead; admin.",dont:"Do not 'fix' Production by copying test settings blindly.",tags:"sandbox production differences"});

P({area:"Judgement",title:"The vendor rejects the format",sym:"The vendor says the file is not valid.",
may:["Spec misunderstood","Header, trailer or delimiter wrong","Encoding or line ending","Field length or value not allowed"],
check:["Ask for the exact error and line.","Compare the file with the spec.","Look at the first and last lines in a text editor.","Test a small file."],
evid:["Vendor's message","File sample (dummy)"],who:"Vendor contact.",dont:"Do not guess new formats in Production.",tags:"vendor reject format"});
P({area:"How do I...",title:"How do I get all positions from staffing events?",sym:"You need every job of every worker, using staffing events or worker history.",
may:["Your report shows only the primary job","One row per worker hides extra jobs","Ended jobs are filtered out","Wrong as-of dates"],
check:["Pick one route: report, Get_Workers web service, or Core Connector.","For a report: run Business Object Details on the Worker object and find the fields that return all positions.","For Get_Workers: set As_Of_Effective_Date and As_Of_Entry_DateTime yourself.","For a connector: turn on Include Multiple Positions.","Write one row per job.","Test with a worker who has two jobs. Count rows against jobs."],
evid:["Field names used","Dates used","Row count and job count"],who:"Your lead for report and field names in your tenant.",dont:"Do not trust a list of field names from a book. Check them in your own tenant.",tags:"positions staffing events multiple jobs how to"});
})();
