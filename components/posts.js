"use client";

import { formatDate } from "@/lib/format";
import LikeButton from "./like-icon";
import { togglePostLikeStatus } from "@/actions/posts";
import { useOptimistic } from "react";

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{" "}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form 
              action={action.bind(null, post.id)} 
              className={post.isLiked ? 'liked' : ''}
            >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  // useOptimistic(state, updateFn)
  // although action(update like to database) takes time to complete, immediately present the result of action(heart changes)
  // updateFn(currentState, optimisticValue) returns resulting optimistic state 
  // updateFn updates client side(posts) until the change has been processed on the server side 
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(posts, (prevPosts, updatedPostsId) => {
    // find the updated post
    const updatedPostIndex = prevPosts.findIndex(post => post.id === updatedPostsId);

    if (updatedPostIndex === -1) {
      return prevPosts;
    }

    // manipulate the updated post by immutable way = copying original then manipulate
    const updatedPost = { ...prevPosts[updatedPostIndex] };
    updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);
    updatedPost.isLiked = !updatedPost.isLiked;
    // copying original posts
    const newPosts = [...prevPosts];
    // replace 
    newPosts[updatedPostIndex] = updatedPost;
    // this is 'optimisticPosts'
    return newPosts;
  })

  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  async function updatePost(postId) {
    // updateFn updates client side(posts) until the change has been processed on the server side 
    updateOptimisticPosts(postId);
    // this async function communicate with database
    await togglePostLikeStatus(postId);
  }

  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost}/>
        </li>
      ))}
    </ul>
  );
}
