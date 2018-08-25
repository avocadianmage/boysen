using BoysenHost.PSHostContract;
using System;
using System.Linq;
using System.Management.Automation;
using System.Management.Automation.Host;
using System.Management.Automation.Runspaces;

namespace BoysenHost
{
    class BoysenConsole
    {
        static void Main() => new BoysenConsole().run();

        readonly Runspace myRunspace;
        readonly CustomHost myHost = new CustomHost();

        readonly object powerShellLock = new object();
        PowerShell currentPowerShell; //TODO: constant powershell instance?

        public BoysenConsole()
        {
            myRunspace = createRunspace(myHost);
            hookControlC();
        }

        Runspace createRunspace(PSHost host)
        {
            var runspace = RunspaceFactory.CreateRunspace(host);
            runspace.Open();
            return runspace;
        }

        void hookControlC()
        {
            Console.CancelKeyPress += onConsoleCancelKeyPress;
            Console.TreatControlCAsInput = false;
        }

        //TODO: cleanup
        void onConsoleCancelKeyPress(object sender, ConsoleCancelEventArgs e)
        {
            try
            {
                lock (powerShellLock)
                {
                    myHost.UI.WriteLine();
                    myHost.UI.WriteErrorLine(e.SpecialKey.ToString());

                    if (currentPowerShell?.InvocationStateInfo.State
                        == PSInvocationState.Running)
                    {
                        currentPowerShell.Stop();
                    }

                    e.Cancel = true;
                }
            }
            catch (Exception exception)
            {
                myHost.UI.WriteErrorLine(exception.ToString());
            }
        }

        void run()
        {
            while (!myHost.ExitCode.HasValue)
            {
                Console.Out.Write("boysen prompt: "); //TODO: pull actual prompt
                execute(Console.ReadLine());
            }

            Environment.Exit(myHost.ExitCode.Value);
        }

        void execute(string input)
        {
            // Ignore empty input.
            if (string.IsNullOrWhiteSpace(input)) return;

            //TODO: factor out powershell object creation into a separate
            // method that takes in an action and invokes it
            lock (powerShellLock) currentPowerShell = PowerShell.Create();
            try
            {
                currentPowerShell.Runspace = myRunspace;

                currentPowerShell.AddScript(input);
                currentPowerShell.AddCommand("out-default"); //TODO: needed?
                currentPowerShell.Commands.Commands.First().MergeMyResults(
                    PipelineResultTypes.Error, PipelineResultTypes.Output);
                currentPowerShell.Invoke();
            }
            finally
            {
                lock (powerShellLock)
                {
                    currentPowerShell.Dispose();
                    currentPowerShell = null;
                }
            }
        }
    }
}