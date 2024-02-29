import { useRouter } from "next/router";
import '../../../configureAmplify';
import { API, Storage } from "aws-amplify";
import { getPost, listPosts } from "@/graphql/queries";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
    ssr: false,
  });
  import "easymde/dist/easymde.min.css";
import { createComment } from "@/graphql/mutations";
  

const initialState = { title: "" };

export default function Post({post}){
    const [coverImage, setCoverImage] = useState(null);
    const [comment, setComment] = useState(initialState);
    const [showMe, setShowMe] = useState(false);
    const {title} = comment;

    function toggle(){
        setShowMe(!showMe);
    }

    useEffect(() => {
        updateCoverImage();
    }, [])

    async function updateCoverImage(){
        if(post.coverImage){
            const imageKey = await Storage.get(post.coverImage);
            setCoverImage(imageKey);
        }
    }

    const router = useRouter()
    if (router.isFallback){
        return <div>Loading...</div>
    }

    async function createTheComment(){
        if (!title) return;
        const id = uuidv4();
        comment.id = id;
        try{
            await API.graphql({
                query: createComment,
                variables: {input: comment},
                authMode: "AMAZON_COGNITO_USER_POOLS"
        })
        }catch(error){
            console.log(error)
        }
        router.push("/my-posts");
    }

    return (
        <div>
            <h1 className="text-5xl mt-4 font-semibold tracing-wide">{post.title}</h1>
            {
                coverImage && (
                    <img src={coverImage} className="mt-4" />
                )
            }
            <p className="text-sm font-light my-4">By {post.username}</p>
            <div className="mt-8">
                <Markdown className="prose" children={post.content}/>
            </div>
            <div>
                <button
                    type="button"
                    className="mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-lg"
                    onClick={toggle}
                >Write a comment</button>
                {
                    showMe && <div>
                        <SimpleMDE
                            value={comment.title}
                            onChange={(value) => setComment({...comment, title: value, postID: post.id})}
                        />
                        <button 
                            type="button"
                            onClick={createTheComment}
                            className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
                        >Save</button>
                    </div>
                }
            </div>
        </div>
    )
}

export async function getStaticPaths(){
    const postData = await API.graphql({
        query: listPosts
    })
    const paths = postData.data.listPosts.items.map(post => ({ params: { id: post.id } }))
    return {
        paths, 
        fallback: true
    }
}

export async function getStaticProps({params}){
    const {id} = params;
    const postData = await API.graphql({
        query: getPost,
        variables: { id }
    })
    return{
        props: {
            post: postData.data.getPost
        },
        revalidate: 1
    }
}