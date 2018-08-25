using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Management.Automation;
using System.Management.Automation.Host;
using System.Security;

namespace BoysenHost.PSHostContract
{
    class CustomHostUI : PSHostUserInterface
    {
        #region PSHostUserInterface implementation

        public override PSHostRawUserInterface RawUI { get; } 
            = new CustomHostRawUI();

        //TODO: implement all
        public override Dictionary<string, PSObject> Prompt(string caption, string message, Collection<FieldDescription> descriptions)
        {
            throw new NotImplementedException();
        }

        public override int PromptForChoice(string caption, string message, Collection<ChoiceDescription> choices, int defaultChoice)
        {
            throw new NotImplementedException();
        }

        public override PSCredential PromptForCredential(string caption, string message, string userName, string targetName)
        {
            throw new NotImplementedException();
        }

        public override PSCredential PromptForCredential(string caption, string message, string userName, string targetName, PSCredentialTypes allowedCredentialTypes, PSCredentialUIOptions options)
        {
            throw new NotImplementedException();
        }

        public override string ReadLine() => Console.ReadLine();

        public override SecureString ReadLineAsSecureString()
        {
            throw new NotImplementedException();
        }

        public override void Write(string value) => Console.Out.Write(value);

        public override void Write(
            ConsoleColor foregroundColor, 
            ConsoleColor backgroundColor, 
            string value)
        {
            write(Console.Out, foregroundColor, backgroundColor, value);
        }

        public override void WriteDebugLine(string message)
        {
            specialMessageWriteLine(ConsoleColor.Cyan, "Debug", message);
        }

        public override void WriteErrorLine(string value)
        {
            var errorStream = Console.Error;
            write(
                errorStream, ConsoleColor.Red, Console.BackgroundColor, value);
            errorStream.WriteLine();
        }

        public override void WriteLine(string value) 
            => Console.Out.WriteLine(value);

        public override void WriteProgress(long sourceId, ProgressRecord record)
        {
            throw new NotImplementedException();
        }

        public override void WriteVerboseLine(string message)
        {
            specialMessageWriteLine(ConsoleColor.DarkGray, "Verbose", message);
        }

        public override void WriteWarningLine(string message)
        {
            specialMessageWriteLine(ConsoleColor.Yellow, "Warning", message);
        }

        #endregion

        void write(
            TextWriter stream,
            ConsoleColor foregroundColor,
            ConsoleColor backgroundColor,
            string value)
        {
            var cachedForeground = Console.ForegroundColor;
            var cachedBackground = Console.BackgroundColor;
            Console.ForegroundColor = foregroundColor;
            Console.BackgroundColor = backgroundColor;
            stream.Write(value);
            Console.ForegroundColor = cachedForeground;
            Console.BackgroundColor = cachedBackground;
        }

        void specialMessageWriteLine(
            ConsoleColor foregroundColor, string prefix, string message)
        {
            WriteLine(
                foregroundColor,
                Console.BackgroundColor,
                $"[{prefix}] {message}");
        }
    }
}
