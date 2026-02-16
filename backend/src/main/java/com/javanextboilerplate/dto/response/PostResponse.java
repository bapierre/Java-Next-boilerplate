package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.Post;
import com.javanextboilerplate.entity.PostStats;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PostResponse {

    private Long id;
    private String platformPostId;
    private String platform;
    private String channelName;
    private String title;
    private String postUrl;
    private String thumbnailUrl;
    private LocalDateTime publishedAt;
    private Long viewsCount;
    private Long likesCount;
    private Long commentsCount;
    private Long sharesCount;

    public static PostResponse from(Post post) {
        PostStats latest = post.getLatestStats();
        return new PostResponse(
                post.getId(),
                post.getPlatformPostId(),
                post.getChannel().getPlatform().getValue(),
                post.getChannel().getChannelName(),
                post.getTitle(),
                post.getPostUrl(),
                post.getThumbnailUrl(),
                post.getPublishedAt(),
                latest != null ? latest.getViewsCount() : 0L,
                latest != null ? latest.getLikesCount() : 0L,
                latest != null ? latest.getCommentsCount() : 0L,
                latest != null ? latest.getSharesCount() : 0L
        );
    }
}
