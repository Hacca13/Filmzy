import ciak from '../assets/ciak.svg';

/** Il marchio: il ciak e il nome. La misura la decide il foglio di stile. */
export function Brand({ size = 'small' }: { size?: 'small' | 'large' }) {
  return (
    <span className="brand" data-size={size}>
      <img src={ciak} alt="" />
      <span>filmzy</span>
    </span>
  );
}
