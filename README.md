# NetMGLab

<div align="center">
  <!-- Build Status -->
  <a href="https://github.com/IngenieroFiestero/NetMGLab">
    <img src="https://travis-ci.org/IngenieroFiestero/NetMGLab.svg?branch=master"
      alt="Build Status" />
  </a>
</div>

### A complete Network Management Laboratory for SNMP and NETCONF.

![Image of NetMGLab](https://raw.githubusercontent.com/IngenieroFiestero/NetMGLab/master/NetMGLab.png)

## Compatibilities

In Windows it's not possible to share UDP ports between all processes like when using TCP. I'm looking for a solution but at the moment it does not seem like anyone is going to fix the bug in the libraries.
In windows a snmp agent is only in one process.