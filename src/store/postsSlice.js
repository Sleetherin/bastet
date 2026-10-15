import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';

//this is an async thunk for fetching posts from reddit
export const fetchPosts = createAsyncThunk('posts/fetchPosts', 
    async (subreddit, thunkAPI) => {
        try {
            // use the local proxy server to avoid CORS issues in the browser
            const response = await axios.get(`/api/r/${subreddit}`);
            return response.data.data.children.map((child)=> child.data);
        } catch (err) {
            // surface a useful message to the rejected action
            if (err.response) {
                return thunkAPI.rejectWithValue(`Reddit responded with status ${err.response.status}`);
            }
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);




//initial state for the slice
const initialState = {
    posts:[],
    status:'idle',
    error:null,
}




const postsSlice = createSlice({
    name:'posts',
    initialState,
    error:null,
    reducers:{},
    extraReducers:(builder) => {
        builder
        .addCase(fetchPosts.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchPosts.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.posts = action.payload;
        })
        .addCase(fetchPosts.rejected, (state,action) => {
            state.status = 'failed';
            // prefer the payload message if available
            state.error = action.payload || "HISS!! EITHER YOU MISSED A STEP OR THAT TOPIC DOESN'T EXIST!";
       })
    }
});

//export {fetchPosts};
export default postsSlice.reducer;
