using System;
using System.Globalization;
using System.Management.Automation.Host;
using System.Threading;

namespace BoysenHost.PSHostContract
{
    class CustomHost : PSHost
    {
        #region PSHost implementation

        public override CultureInfo CurrentCulture { get; }
            = Thread.CurrentThread.CurrentCulture;
        public override CultureInfo CurrentUICulture { get; }
            = Thread.CurrentThread.CurrentUICulture;
        public override Guid InstanceId { get; } = Guid.NewGuid();
        public override string Name => nameof(BoysenHost);
        public override PSHostUserInterface UI { get; } = new CustomHostUI();
        public override Version Version { get; } = new Version(0, 1);

        //TODO: implement all
        public override void EnterNestedPrompt()
        {
            throw new NotImplementedException();
        }

        public override void ExitNestedPrompt()
        {
            throw new NotImplementedException();
        }

        public override void NotifyBeginApplication()
        {
            throw new NotImplementedException();
        }

        public override void NotifyEndApplication()
        {
            throw new NotImplementedException();
        }

        public override void SetShouldExit(int exitCode) => ExitCode = exitCode;

        #endregion

        public int? ExitCode { get; private set; }
    }
}