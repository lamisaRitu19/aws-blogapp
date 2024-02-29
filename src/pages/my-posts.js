import { postsByUsername } from "@/graphql/queries";
import { deletePost as deletePostMutation } from "@/graphql/mutations";
import { API, Auth, Storage } from "aws-amplify";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { attributes, username } = await Auth.currentAuthenticatedUser();
    const userName = `${attributes.sub}::${username}`;
    const postData = await API.graphql({
      query: postsByUsername,
      variables: { username: userName },
    });
    const { items } = postData.data.postsByUsername;
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

  async function deletePost(iD) {
    await API.graphql({
      query: deletePostMutation,
      variables: { input: { id: iD } },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    fetchPosts();
  }

  return (
    <div className="">
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
        My Posts
      </h1>
      {posts.map((post, index) => (
        <div
          key={index}
          className="py-8 px-8 max-w-xxl mx-auto bg-white rounded-lg sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-4 text-center sm:text-left flex items-center gap-3"
        >
          {
            post.coverImage && <img src={post.coverImage} className="w-32 h-32 bg-contain bg-center rounded-full sm:mx-0 sm:shrink-0" />
          }
          <div>
            <div className="mb-2">
                <p className="text-lg text-black font-semibold">
                  Title: {post.title}
                </p>
                <p className="text-slate-500 font-medium">
                  Content: {post.content}
                </p>
            </div>
            <div>
              <Link
                href={`/edit-post/${post.id}`}
                className="font-bold text-sm text-purple-600 border border-gray-300 rounded-2xl px-3 py-1 mr-3"
              >
                Edit Post
              </Link>
              <Link
                href={`/posts/${post.id}`}
                className="font-bold text-sm text-purple-600 border border-gray-300 rounded-2xl px-3 py-1 mr-3"
              >
                View Post
              </Link>
              <button
                onClick={() => deletePost(post.id)}
                className="font-bold text-sm text-red-600 "
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
