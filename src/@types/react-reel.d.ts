declare module 'react-reel' {
    interface IReelProps {
        text: string;
        duration?: number;
        delay?: number;
        theme?: Record<string, string>;
    }

    const Reel: React.FC<IReelProps>;

    export default Reel;
}
