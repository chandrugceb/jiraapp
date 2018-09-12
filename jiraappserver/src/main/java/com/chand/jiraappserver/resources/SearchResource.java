package com.chand.jiraappserver.resources;

import com.chand.jiraappserver.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins="http://localhost:4200,http://localhost:80")
public class SearchResource {
    @Autowired
    SearchService searchService;
    @PostMapping("/search")
    public String search(@RequestBody String query){
        System.out.println(query);
        return searchService.search(query);
    }

    @GetMapping("/issue/{key}")
    public String getIssue(@PathVariable("key") String key, @RequestParam("maxResults") String maxResults, @RequestParam("startAt") String startAt){
        System.out.println(key);
        return searchService.getIssues(key, maxResults, startAt);
    }
}
