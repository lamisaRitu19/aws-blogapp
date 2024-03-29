import { listPosts } from "@/graphql/queries";
import { useEffect, useState } from "react";
import { API, Amplify, Storage } from 'aws-amplify';
import awsExports from '../aws-exports';
import Link from "next/link";

Amplify.configure({ ...awsExports, ssr: true });

export default function Home() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetchPost();
  }, [])

  async function fetchPost(){
    const postData = await API.graphql({
      query: listPosts
    })
    const { items } = postData.data.listPosts;
    const postWithImages = await Promise.all(
      items.map(async (post) => {
        if (post.coverImage){
          post.coverImage = await Storage.get(post.coverImage)
        }
        return post;
      })
    )
    setPosts(postWithImages);
  }
  
  return (
    <main>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-8">All Posts</h1>
      {
        posts.map((post, index) => <Link key={index} href={`/posts/${post.id}`}>
          <div className="my-6 pb-6 border-b border-gray-300">
            {
              post.coverImage && (
                <img src={post.coverImage} className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shrink-0" />
              )
            }
            <div className="cursor-pointer mt-2">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-500">Author: {post.username}</p>
              {
                post.comments.items.length > 0 &&
                post.comments.items.map((comment, index) => <div
                  key={index}
                  className="py-8 px-8 max-w-xl mx-10 mt-4 bg-white rounded-lg shadow-lg space-y-2 sm:py-1 sm:flex"
                >
                  <div>
                    <p className="text-gray-500 mt-2">{comment.title}</p>
                    <p className="text-gray-200 mt-1">{comment.createdBy}</p>
                  </div>
                </div>)
              }
            </div>
          </div>
        </Link>)
      }
    </main>
  );
}


// "@aws-amplify/storage": "^6.0.17",
// "@aws-amplify/ui-react": "5.3.2",