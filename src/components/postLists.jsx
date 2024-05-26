import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query'
import { addPost, fetchPosts, fetchTags } from '../api/api';
import './post.css'
import { useState } from 'react';
const PostLists = () => {
   const [page,setPage]=useState(1)
   const {data:postData,error:postError,isLoading,isError:isPostsError}=useQuery({
    queryKey:["posts",{page}],
    queryFn:()=>fetchPosts(page),
    staleTime:5*1000*60   //this will keep data cached and fetch after 5 mins
    //gcTime:0,   ///query data will never be cached and remain in stale
    //refetchInterval:1000*5  ///every 5sec it will keep fetching it
   }) 

   const {data:tagsData}=useQuery({
    queryKey:["tags"],
    queryFn:fetchTags,
    staleTime:Infinity
   })

   const queryClient=useQueryClient()

   const {mutate,isError,isPending,error,reset}=useMutation({
        mutationFn:addPost,
        onMutate:()=>{
            return {id:1};
        },
        onSuccess:()=>{
           queryClient.invalidateQueries({
            queryKey:["posts"],
            exact:true,
        })
        },
        /* onError:(error,variables,context)=>{
s 
        },
        onSettled:(data,error,variables,context)=>{

        } */

   })

const handleSubmit=(e)=>{
    e.preventDefault()
   const formData=new FormData(e.target)
   const title=formData.get('title')
   const tags=Array.from(formData.keys()).filter((key)=>formData.get(key)==='on')

   if(!title || !tags) return;

   mutate({
    id:(postData.items+1).toString(),title,tags
   })
   e.target.reset()
   }



  return (
    <div className='container'>
        <form onSubmit={handleSubmit}>
            <input type='text' placeholder='Enter your post..' className='postbox' name='title'/>
            <div className='tags'>
                {tagsData?.map((tag)=>{
                    return(
                        <div key={tag}>
                            <input name={tag} id={tag} type="checkbox" className='checkbox'/>
                            <label htmlFor={tag} className='label'>{tag}</label>
                        </div>
                    )
                })}
            </div>
            <button>Post</button>
        </form>
        {isLoading && isPending && <p>...Loading</p>}
        {isError && <p>{error?.message}</p>}
        {isPostsError && <p onClick={()=>reset()}>{postError?.message}</p>}

        <div className='pages'>
                <button onClick={()=>setPage((old)=>Math.max(old-1,0))}
                disabled={!postData?.prev}>Previous page</button>
                <span>{page}</span>
                <button onClick={()=>setPage((old)=>old+1)}
                disabled={!postData?.next}>Next Page</button>
        </div>

        {
            postData?.data?.map((post)=>{
                return (
                    <div key={post.id} className='post'>
                        <table>
                            <th></th>
                        </table>
                        <div>{post.title}</div>
                        {
                            post.tags.map((tag,index)=><span key={index}>{tag}</span>)
                        }
                    </div>
                )
            })
        }
    </div>
  )
}

export default PostLists