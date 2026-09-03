match /datePlannerRooms/{roomCode} {

  allow get: if request.auth != null;

  allow list: if false;

  allow create: if
    request.auth != null
    && request.resource.data.player1Uid == request.auth.uid
    && request.resource.data.player2Uid == null
    && request.resource.data.player1Finished == false
    && request.resource.data.player2Finished == false;

  allow update: if request.auth != null && (

    (
      resource.data.player2Uid == null
      && request.resource.data.player2Uid == request.auth.uid
      && request.auth.uid != resource.data.player1Uid
      && request.resource.data
          .diff(resource.data)
          .affectedKeys()
          .hasOnly([
            'player2Uid'
          ])
    )

    ||

    (
      request.auth.uid == resource.data.player1Uid
      && request.resource.data
          .diff(resource.data)
          .affectedKeys()
          .hasOnly([
            'player1Choices',
            'player1Finished',
            'player1Rankings',
            'rankingFinished1',
            'filters',
            'selectedDateIds'
          ])
    )

    ||

    (
      request.auth.uid == resource.data.player2Uid
      && request.resource.data
          .diff(resource.data)
          .affectedKeys()
          .hasOnly([
            'player2Choices',
            'player2Finished',
            'player2Rankings',
            'rankingFinished2'
          ])
    )
  );

  allow delete: if false;
}
