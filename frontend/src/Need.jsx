import React, { useEffect, useState } from 'react';
import { Button, Card, CardActions, CardContent, Dialog, DialogContent, DialogContentText, Typography } from '@material-ui/core'
import MeetNeed from './MeetNeed'

const Need = props => {

    const [n, setNeed] = useState(props);
    const [meetOpen, setMeetOpen] = useState({meetOpen: false})

    useEffect(() => {
        setNeed(props);
      }, [props]);

    return (
        <div>
            <Card variant="outlined">
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                    Community Need
                    </Typography>
                    <Typography >
                        Name: {n.needingUser.name}
                    </Typography>
                    <Typography color="textSecondary">
                        Need: {n.need}
                    </Typography>
                </CardContent>
                <CardActions>
                    { (!meetOpen.meetOpen)
                      ? <Button size="small" onClick={() => setMeetOpen({meetOpen: true})}>I can fulfill this need</Button>
                      : <Dialog open={meetOpen.meetOpen} onClose={() => setMeetOpen({meetOpen: false})} aria-labelledby="form-dialog-title" >
                            <DialogContent>
                                <DialogContentText>
                                    Thank you for volunteering to meet this need! Please complete this form and we will be in touch soon.
                                </DialogContentText>
                                <MeetNeed closeNeed={() => setMeetOpen({meetOpen: false})} {...n}/>
                            </DialogContent>
                        </Dialog>
                    }
                </CardActions>
                </Card>
        </div>
    )
};
export default Need;