import { MDXRemote } from "next-mdx-remote/rsc";

type Props = {
  source: string;
};

export default function MdxContent({ source }: Props) {
  return (
    <div className="prose">
      <MDXRemote source={source} />
    </div>
  );
}
