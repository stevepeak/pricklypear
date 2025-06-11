import { Toaster as Sonner, type ToasterProps } from 'sonner';

const SonnerComponent = (props: ToasterProps) => {
  return <Sonner {...props} theme={props.theme} className="sonner group" />;
};

export { SonnerComponent as Sonner };
