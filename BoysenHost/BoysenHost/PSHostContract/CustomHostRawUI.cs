using System;
using System.Management.Automation.Host;

namespace BoysenHost.PSHostContract
{
    class CustomHostRawUI : PSHostRawUserInterface
    {
        public override ConsoleColor ForegroundColor
        {
            get => Console.ForegroundColor;
            set => Console.ForegroundColor = value;
        }

        public override ConsoleColor BackgroundColor
        {
            get => Console.BackgroundColor;
            set => Console.BackgroundColor = value;
        }

        public override Coordinates CursorPosition
        {
            get => new Coordinates(Console.CursorLeft, Console.CursorTop);
            set => Console.SetCursorPosition(value.X, value.Y);
        }

        public override Coordinates WindowPosition
        {
            get => new Coordinates(Console.WindowLeft, Console.WindowTop);
            set => Console.SetWindowPosition(value.X, value.Y);
        }

        public override int CursorSize
        {
            get => Console.CursorSize;
            set => Console.CursorSize = value;
        }

        public override Size BufferSize
        {
            get => new Size(Console.BufferWidth, Console.BufferHeight);
            set => Console.SetBufferSize(value.Width, value.Height);
        }

        public override Size WindowSize
        {
            get => new Size(Console.WindowWidth, Console.WindowHeight);
            set => Console.SetWindowSize(value.Width, value.Height);
        }

        public override Size MaxWindowSize => new Size(
            Math.Min(MaxPhysicalWindowSize.Width, BufferSize.Width),
            Math.Min(MaxPhysicalWindowSize.Height, BufferSize.Height));

        public override Size MaxPhysicalWindowSize { get; }
            = new Size(Console.LargestWindowWidth, Console.LargestWindowHeight);

        public override bool KeyAvailable => Console.KeyAvailable;

        public override string WindowTitle
        {
            get => Console.Title;
            set => Console.Title = value;
        }

        //TODO: implement all
        public override void FlushInputBuffer()
        {
            throw new NotImplementedException();
        }

        public override BufferCell[,] GetBufferContents(Rectangle rectangle)
        {
            throw new NotImplementedException();
        }

        public override KeyInfo ReadKey(ReadKeyOptions options)
        {
            throw new NotImplementedException();
        }

        public override void ScrollBufferContents(Rectangle source, Coordinates destination, Rectangle clip, BufferCell fill)
        {
            throw new NotImplementedException();
        }

        public override void SetBufferContents(Coordinates origin, BufferCell[,] contents)
        {
            throw new NotImplementedException();
        }

        public override void SetBufferContents(Rectangle rectangle, BufferCell fill)
        {
            throw new NotImplementedException();
        }
    }
}
