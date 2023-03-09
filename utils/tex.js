const fs = require("fs");
const lescape = require("./escape.js");
const axios = require("axios");

let logoURL =
  // `https://firebasestorage.googleapis.com/v0/b/quizmine-dev.appspot.com/o/logos%2FXC2s9Gp04Kd6fpBnIZnjo4hRUAR2.2022-05-15T16%3A14%3A55.832Z?alt=media&token=cd625cf2-1bef-4727-aec0-7bd6ae9b726a`;
  "https://storage.googleapis.com/quizmine-a809e.appspot.com/logos/YPL11WYDWP.jpg";
let logoFileName = "";

console.log(logoFileName);

(async () => {
  try {
    // TODO: This does download the whole file so is inefficient and should be updated
    const response = await axios.get(logoURL);

    const contentType = response.headers["content-type"];
    console.log(response.headers);
    logoFileName = `logo.${contentType.split("/")[1]}`;
  } catch (error) {
    console.error("Error fetching headers from logo resource", error);
  }
})();

let texdata = `\\documentclass{article}
\\usepackage{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{textcomp}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{soul}
\\usepackage{graphicx}
 \\geometry{
 a4paper,
 total={170mm,257mm},
 left=20mm,
 top=20mm,
 }
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{multicol}
\\setlength{\\columnsep}{35pt}
\\setlength{\\arrayrulewidth}{1mm} 
\\setlength{\\tabcolsep}{6pt} 
\\renewcommand{\\arraystretch}{2} 
\\begin{document}
${
  true
    ? `\\begin{tabular}{  m{7em}  }

    \\immediate\\write18{
      wget -O ${lescape(logoFileName)} ${lescape(logoURL)}
    }

  \\includegraphics[width=20mm,scale=1]{${logoFileName}}
\\end{tabular}`
    : ``
}
  \\begin{tabular}{ | m{5cm}  m{3cm}|  }

  \\hline
    
  \\parbox[m]{10cm}{\\vspace*{8pt} \\textbf{\\large Exam Title}
  \\newline 1st April 2019\\newline SHS ECONOMICS\\newline ESSAY\\newline 2 hours \\vspace*{4pt}} & \\hspace*{0.5cm} {\\textbf{\\huge 2 \\& 1}} \\\\
    
    \\hline
  \\end{tabular}
    \\begin{tabular}{  m{5em}  }

    \\parbox[m]{15cm}{\\hspace*{0.5cm}Name:.......................... 
      \\vspace*{1pt}} \\
        \\parbox[m]{15cm}{\\hspace*{0.5cm}Index Number:.......................... 
      \\vspace*{1pt}}

  \\end{tabular}
\\begin{center}
Exam Title
\\end{center}
\\begin{center}
School Name
\\end{center}
Today \\hfill Title for exam \\hfill 3 HOURS
\\begin{center}

\\end{center}
\\pagebreak 
\\end{document}`;

fs.writeFile(
  "new.tex",
  texdata,
  // `\\documentclass{article}\\usepackage{graphicx}\\usepackage{multicol} \\graphicspath{ {./images/} } \\begin{document}  \\begin{multicols}{2}\\noindent1. The polynomial is with a function and update to see what happens \\(f(x)=2x^3-4x^2+x-7\\) is divided by (x-1). Find the \\textbf{remainder} \\newline 2. What property of addition is defined by: (a + b) + c = a + (b + c)? \\newline \\newline 3. Express \\( \\frac{2}{3-\\sqrt 7}\\) in the form \\( a +\\sqrt b\\), where \\( a \\) and \\( b \\) are integers. \\newline 4. If \\(y=x^3-2x^2+1\\). Find \\(\\frac{dy}{dx}\\)\\newline \\newline 5. Find the local maximum value of the curve \\(y=x^3-3x^2\\) \\newline \\end{multicols} \\end{document}`,
  function (err) {
    if (err) throw err;
    console.log("Saved!");
  }
);
