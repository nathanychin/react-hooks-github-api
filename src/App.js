import React, { useState } from 'react';
import useFetchJobs from './useFetchJobs'
import { Container } from 'react-bootstrap'
import Job from './Job'
import JobsPagination from './JobsPagination'
import SearchForm from './SearchForm';

function App() {
  const [params, setParams] = useState({})
  const [page, setPage] = useState(1)
  const { jobs, loading, error, hasNextPage } = useFetchJobs(params, page)

  function handleParamChange(e){
    const param = e.target.name // Description of search form
    const value = e.target.value // Value typed in
    setPage(1) // Defaults to page 1
    setParams(prevParams => {
      return {...prevParams, [param]: value } // Param is used as key
    })
  }

  return (
    <Container className="my-4">
      <h1 className="mb-4">GitHub Jobs</h1>
      <SearchForm params={params} onParamChange={handleParamChange}/>
      <JobsPagination page={page} setPage={setPage} hasNextPage={hasNextPage}/>
      {loading && <h1>Loading...</h1>}
      {error && <h1>Error. Try refreshing.</h1>}
      {jobs.map(job => {
        return <Job key={job.id} job={job}/> // Key needed since this uses a map loop
      })}
      <JobsPagination page={page} setPage={setPage} hasNextPage={hasNextPage}/>
    </Container>
  );
}

export default App;
