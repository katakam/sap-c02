(function(){
var P=BOOK.PB,E=BOOK.E,Q=BOOK.Q,J=BOOK.JD;
E("fm","Stylesheet (XSLT)","The XSLT file: a list of rules saying what to write when a part of the XML is found.","payroll_to_csv.xsl","You may not write it from scratch, but you must be able to read it and test it.",1,"w","xslt stylesheet rules xsl");
E("fm","xsl:for-each","An XSLT instruction that repeats its lines once for every matching item.","One pass per Report_Entry.","This is why three workers give three lines.",1,"w","xslt for-each loop repeat");
E("fm","xsl:value-of","An XSLT instruction that copies the value of a field into the output.","value-of select Legal_Name.","If the field name or namespace is wrong, you get an empty value.",1,"w","xslt value-of select field");
E("fm","xsl:text","An XSLT instruction that writes fixed text, such as a comma, a pipe or a new line.","The comma between columns.","New line is written as &#10;.",2,"w","xslt text comma newline");
E("fm","xsl:output","An XSLT line that sets the result type: text, xml, html.","method=\"text\" for a CSV.","Pick text for flat files and xml for another XML.",2,"w","xslt output method text xml");
E("fm","Match pattern (xsl:template match)","The part of a rule that says which XML part the rule is for.","match=\"/wd:Report_Data\".","Wrong path or namespace means the rule never fires.",2,"w","xslt template match");
E("fm","Well-formed XML","XML where every tag is closed, nested properly and quoted correctly.","<a><b/></a>","The XML and the stylesheet must both be well-formed.",1,"w","xml well-formed valid");
E("fm","XSLT 1.0","The older, widely supported version of XSLT used by most integration tools.","translate, substring, concat.","Functions available depend on the version. Check what your tool supports.",3,"w","xslt version 1.0 functions");

P({area:"Run problems",title:"XSLT gives empty output or wrong columns",sym:"The transformation completes but the file is empty, or a column is blank or in the wrong place.",
may:["Namespace address in the stylesheet does not match the XML","Match path is wrong","Field name is misspelled","A filter removes every row","Date or number format is not what the receiver expects","The input XML changed shape after a report change"],
check:["Open a small sample of the XML and the stylesheet side by side.","Compare the namespace address (xmlns:wd) in both, character by character.","Check the match path and each value-of path against the XML.","Remove the filter and see if rows come back.","Check one row end to end against the Workday screen.","Run the same XSLT in the XSLT playground in this book with the sample XML.","Remember Workday does not validate your XSLT. Test before go-live."],
evid:["Sample XML (masked)","Stylesheet version","Output sample"],who:"The integration developer; your lead for approval of any change.",dont:"Do not edit the stylesheet in Production without a change request.",tags:"xslt empty output namespace columns transformation"});

Q({part:"fm",q:"What does xsl:for-each do?",o:["Deletes rows","Repeats its lines for every matching item","Encrypts the file","Sends the file"],a:1,w:"Three entries give three passes, so three lines."});
Q({part:"fm",q:"You get empty output and no error. A common cause is:",o:["The wrong namespace address","A slow network","A long file name","A missing password"],a:0,w:"If the namespace does not match, the rule never fires."});
Q({part:"fm",q:"Which output method gives a CSV?",o:["method=\"xml\"","method=\"text\"","method=\"html\"","method=\"pdf\""],a:1,w:"Text means plain text, with no tags left."});
Q({part:"fm",q:"ETV and XTT: what is the difference?",o:["ETV gives XML, XTT gives text","They are the same","ETV encrypts","XTT sends emails"],a:0,w:"ETV keeps XML. XTT turns the result into text such as delimited or fixed length."});
J({area:"Skills to build",item:"Read and test an XSLT transformation",plain:"Understand how XML becomes CSV or another XML, and spot common mistakes.",tags:"xslt xml csv transform",go:[["XSLT film","#movie"],["XSLT playground","#l-xslt"],["Search XSLT","q:xslt"]]});
})();
