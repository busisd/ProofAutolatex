/*
	Author: Daniel Busis
	Meant to work with the code at http://proofs.carletonds.com/decker/
	which is written by Kevin Klement and Jason Decker
	
	If a user has checked their proof on the site, this code will generate
	a fitch.sty (Peter Selinger, 2005) proof in Latex.
*/

replacement_dict = {'¬':"\\neg ", '∨':"\\lor ", '→':"\\rightarrow ", '↔':"\\leftrightarrow ", '∧':"\\land ",
						'∀':"\\forall ", '∃':"\\exists "
					}
function text_to_latex(text_string, need_math_mode){
	/*
		Latexifies strings. Replaces m-bars with dashes (as latex crashes
		on m-bars), and special logic characters with their latex command
		equivalents.
		
		If need_math_mode is set to true, latex commands have $ added to 
		either end.
	*/
	latex_string = "";
	for (var i=0; i<text_string.length; i++){
		if (text_string[i] === '–'){
			latex_string += '-'; //Change bad dashes to good dashes
			continue;
		}
		
		if (Object.keys(replacement_dict).includes(text_string[i])) {
			if (need_math_mode) {
				latex_string += "$"+replacement_dict[text_string[i]]+"$"
			} else {
				latex_string += replacement_dict[text_string[i]]
			}
		} else {
			latex_string += text_string[i]
		}
	}
	return latex_string
}

function line_data_to_string(line_data, have_or_hypo){
	/*
		Given a dictionary of the form {wffstr: "logical proposition", jstr: "rule applied"},
		will convert that data into a fitch.sty latex line.
	*/
	var padding = "    ".repeat(global_depth);
	
	var step_text = text_to_latex(line_data["wffstr"], false);
	
	rule_list = line_data["jstr"].split(":");
	var rule_name = "";
	var reference_lines = "";
	if (rule_list.length === 2) {
		rule_name = text_to_latex(rule_list[0], true);
		reference_lines = text_to_latex(rule_list[1], true);
	}
	
    out_str = padding+"\\"+have_or_hypo+" {"+global_line_num+"} {"+step_text+"} \\by{"+rule_name+"}{"+reference_lines+"}\n";
	global_line_num++;
	return out_str;
}

function recurse_convert_to_latex(proof_list){
	/*
		Recursively converts a list of line data dictionaries (see line_data_to_string docs)
		to latex code. This list might have other lists of line data dictionaries within, 
		at which point the recursive call is applied.
	*/
	global_depth++;
	var final_str = ""
	for (var i=0; i<proof_list.length; i++){
		if (proof_list[i] instanceof Array){
			final_str += "    ".repeat(global_depth)+"\\open\n"
			final_str += recurse_convert_to_latex(proof_list[i])
			final_str += "    ".repeat(global_depth)+"\\close\n"
		}
		else {
			if (i < global_num_prems){
				final_str += line_data_to_string(proof_list[i], "hypo")
			} else {
				final_str += line_data_to_string(proof_list[i], "have")
			}
		}
	}
	global_depth--;
	return final_str
}

global_line_num = 1;
global_depth = 0;
global_num_prems = 1;
function start_latex_recursion(p_table){
	/*
		Starts a recurse_convert_to_latex recursion, with some extra steps of 
		certain latex symbols that should appear only at the very beginning and end
		as well as setting some global variables to their correct starting values.
	*/
	global_line_num = 1;
	global_depth = 0;
	global_num_prems = p_table.numPrems;
	var final_latex = "$\n\\begin{nd}\n"
	final_latex += recurse_convert_to_latex(p_table.proofdata)
	final_latex += "\\end{nd}\n$"
	return final_latex
}

// Uncomment these two lines to start the recursion!
// It will be pasted to the console (on Chrome, ctrl+shift+i)
proof_table = document.getElementsByClassName("prooftable")[0];
start_latex_recursion(proof_table)

// Alternatively, create a <pre id="someid"> </pre> and a 
// <button onclick="fill_elem_with_latex('someid')"> Generate LaTeX </button>
// When you click the button, the <pre> element will fill with 
// the latex text!
// Note: the <pre> element is used for preformatted text, and thus
// will respect indentation.
function fill_elem_with_latex(elem_id){
	latex_elem = document.getElementById(elem_id);
	proof_table = document.getElementsByClassName("prooftable")[0];
	latex_elem.innerText = start_latex_recursion(proof_table);
}

