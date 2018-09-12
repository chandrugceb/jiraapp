package com.chand.jiraappserver.service;

import com.sun.jndi.toolkit.url.Uri;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.activation.MimeType;
import java.sql.Time;
import java.util.ArrayList;
import java.util.List;

@Service
public class SearchService {

    RestTemplate restTemplate;

    SearchService(RestTemplateBuilder restTemplateBuilder){
        this.restTemplate = restTemplateBuilder.build();
    }

    HttpHeaders getHeaders(){
        HttpHeaders httpHeaders = new HttpHeaders();
        List<MediaType> acceptedMediaType = new ArrayList<>();
        acceptedMediaType.add(MediaType.APPLICATION_JSON);
        httpHeaders.setAccept(acceptedMediaType);
        httpHeaders.setContentType(MediaType.APPLICATION_JSON);
        httpHeaders.add("Authorization", "Basic Q2hhbmRyYW1vaGFuLk5hdGFyYWo6PlZhc2FudGhpOQ==");
        return httpHeaders;
    }

    public String search(String query){
        HttpEntity<String> requestEntity = new HttpEntity<String>(query, getHeaders());
        String url = "https://fulcrumtech.atlassian.net/rest/api/3/search";
        System.out.println(">> Calling Request");
        long starttime = System.currentTimeMillis();
        String response = this.restTemplate.postForObject(url,requestEntity,String.class);
        long finishtime = System.currentTimeMillis();
        System.out.println(response);
        System.out.println(">> Completed Request in " + (finishtime - starttime) + " ms");

        return response;
    }

    public String getIssues(String key, String maxResults, String startAt){
        HttpEntity<String> requestEntity = new HttpEntity<String>(getHeaders());
        String url = "https://fulcrumtech.atlassian.net/rest/api/3/issue/" + key + "/changelog";
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(url)
                .queryParam("maxResults", maxResults)
                .queryParam("startAt", startAt)
                .queryParam("expand", "key");
        System.out.println(">> Calling Request");
        long starttime = System.currentTimeMillis();
        HttpEntity<String> response = this.restTemplate.exchange(builder.toUriString(),HttpMethod.GET,requestEntity,String.class);
        long finishtime = System.currentTimeMillis();
        System.out.println(response.getBody());
        System.out.println(">> Completed Request in " + (finishtime - starttime) + " ms");

        return response.getBody();
    }
}
