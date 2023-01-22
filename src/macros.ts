const {raw} = String;

export const macros = raw`
% misc
\newcommand{\<}{\left\langle}
\newcommand{\>}{\right\rangle}

\newcommand{\lf}{\left\lfloor}
\newcommand{\rf}{\right\rfloor}

\newcommand{\lc}{\left\lceil}
\newcommand{\rc}{\right\rceil}
\newcommand{\dlog}{\,\operatorname{dlog}\,}

\newcommand{\Nyg}{\mathcal N}
\newcommand{\prism}{
  {\class{prism}{\Delta}}
}

% single-letters
\newcommand{\C}{\mathbf C}
\newcommand{\F}{\mathbf F}
\newcommand{\G}{\mathbf G}
\newcommand{\K}{\operatorname K}
\newcommand{\N}{\mathbf N}
\newcommand{\O}{\mathcal O}
\newcommand{\Q}{\mathbf Q}
\newcommand{\R}{\mathbf R}
\newcommand{\S}{\mathbf S}
\newcommand{\T}{\mathbf T}
\newcommand{\W}{\mathbf W}
\newcommand{\Z}{\mathbf Z}
`;