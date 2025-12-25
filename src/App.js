import './App.css';
import Timeline from './components/Timeline';
import posts from './data/posts.json';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">camila</h1>
      </header>
      <Timeline posts={posts} />
    </div>
  );
}

export default App;
