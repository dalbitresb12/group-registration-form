type FooterLinks = {
  href: string,
  children: React.ReactNode,
};

const links: FooterLinks[] = [
  {
    href: 'https://github.com/dalbitresb12',
    children: (
      <>
        Diseñado por Diego Albitres{' '}
        <img src="/github.svg" alt="GitHub Logo" className="ml-2 h-6" />
      </>
    )
  },
  {
    href: 'https://vercel.com/',
    children: (
      <>
        Hosteado por {' '}
        <img src="/vercel.svg" alt="Vercel Logo" className="ml-2 h-4" />
      </>
    )
  }
];

export const Footer = (): React.ReactElement => {
  return (
    <footer className="w-full h-24 border-t border-solid border-gray-200 flex flex-col justify-center items-center">
      {links.map(link => (
        <a
          key={link.href}
          href={link.href}
          className="flex justify-center items-center mb-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.children}
        </a>
      ))}
    </footer>
  );
};
